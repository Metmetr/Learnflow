import { Router, type Response } from "express";
import { db } from "../db";
import { likes, bookmarks, comments, reports, users, notifications, content } from "../../../shared/schema";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { isAuthenticated as authenticateToken, type AuthRequest } from "../auth";
import {
  insertLikeSchema,
  insertBookmarkSchema,
  insertCommentSchema,
  insertReportSchema,
} from "../../../shared/schema";
import { z } from "zod";

const router = Router();

// Like content
router.post("/likes", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contentId } = insertLikeSchema.parse({
      ...req.body,
      userId: req.user!.id,
    });

    // Check if already liked
    const [existing] = await db
      .select()
      .from(likes)
      .where(
        and(eq(likes.contentId, contentId), eq(likes.userId, req.user!.id))
      )
      .limit(1);

    if (existing) {
      return res.status(400).json({ error: "Already liked" });
    }

    const [newLike] = await db
      .insert(likes)
      .values({ contentId, userId: req.user!.id })
      .returning();

    // Get content info to create notification
    const [contentInfo] = await db
      .select({ title: content.title, authorId: content.authorId })
      .from(content)
      .where(eq(content.id, contentId))
      .limit(1);

    // Create notification for content author (but not if they liked their own content)
    if (contentInfo && contentInfo.authorId !== req.user!.id) {
      const [liker] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, req.user!.id))
        .limit(1);

      await db.insert(notifications).values({
        userId: contentInfo.authorId,
        type: "like_added",
        title: "İçeriğiniz beğenildi",
        message: `${liker?.name || "Bir kullanıcı"} "${contentInfo.title}" başlıklı içeriğinizi beğendi.`,
        contentId,
        read: false,
      });
    }

    res.status(201).json(newLike);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Like error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Unlike content
router.delete("/likes/:contentId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contentId } = req.params;

    await db
      .delete(likes)
      .where(
        and(eq(likes.contentId, contentId), eq(likes.userId, req.user!.id))
      );

    res.json({ message: "Like removed" });
  } catch (error) {
    console.error("Unlike error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Bookmark content
router.post("/bookmarks", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contentId } = insertBookmarkSchema.parse({
      ...req.body,
      userId: req.user!.id,
    });

    // Check if already bookmarked
    const [existing] = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.contentId, contentId),
          eq(bookmarks.userId, req.user!.id)
        )
      )
      .limit(1);

    if (existing) {
      return res.status(400).json({ error: "Already bookmarked" });
    }

    const [newBookmark] = await db
      .insert(bookmarks)
      .values({ contentId, userId: req.user!.id })
      .returning();

    res.status(201).json(newBookmark);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Bookmark error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove bookmark
router.delete("/bookmarks/:contentId", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contentId } = req.params;

    await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.contentId, contentId),
          eq(bookmarks.userId, req.user!.id)
        )
      );

    res.json({ message: "Bookmark removed" });
  } catch (error) {
    console.error("Remove bookmark error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get comments for content
router.get("/comments/:contentId", async (req, res: Response) => {
  try {
    const { contentId } = req.params;

    const allComments = await db
      .select()
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id)) // Changed to leftJoin to debug
      .where(eq(comments.contentId, contentId))
      .orderBy(comments.createdAt); // Keep chronological sort

    // Return flat list (Frontend will handle tree construction)
    const formattedComments = allComments.map(c => ({
      id: c.comments.id, // Adjusted for join result structure
      author: {
        id: c.users?.id || "unknown",
        name: c.users?.name || "Unknown User",
        avatar: c.users?.avatar,
      },
      content: c.comments.body,
      createdAt: c.comments.createdAt,
      parentId: c.comments.parentId,
      replies: [],
    }));

    res.json(formattedComments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create comment
router.post("/comments", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = insertCommentSchema.parse({
      ...req.body,
      authorId: req.user!.id,
    });

    const insertResult = await db
      .insert(comments)
      .values(validatedData)
      .returning();
    const newComment = (insertResult as any[])[0];

    // Get author info
    const [author] = await db
      .select({
        id: users.id,
        name: users.name,
        avatar: users.avatar,
      })
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    // Get content info to create notification
    const [contentInfo] = await db
      .select({ title: content.title, authorId: content.authorId })
      .from(content)
      .where(eq(content.id, newComment.contentId))
      .limit(1);

    // Create notification for content author or parent comment author
    if (newComment.parentId) {
      // This is a reply to a comment
      const [parentComment] = await db
        .select({ authorId: comments.authorId })
        .from(comments)
        .where(eq(comments.id, newComment.parentId))
        .limit(1);

      if (parentComment && parentComment.authorId !== req.user!.id) {
        await db.insert(notifications).values({
          userId: parentComment.authorId,
          type: "comment_reply",
          title: "Yorumunuza yanıt verildi",
          message: `${author?.name || "Bir kullanıcı"} yorumunuza yanıt verdi.`,
          contentId: newComment.contentId,
          commentId: newComment.id,
          read: false,
        });
      }
    } else if (contentInfo && contentInfo.authorId !== req.user!.id) {
      // This is a top-level comment
      await db.insert(notifications).values({
        userId: contentInfo.authorId,
        type: "comment_added",
        title: "İçeriğinize yorum yapıldı",
        message: `${author?.name || "Bir kullanıcı"} "${contentInfo.title}" başlıklı içeriğinize yorum yaptı.`,
        contentId: newComment.contentId,
        commentId: newComment.id,
        read: false,
      });
    }

    res.status(201).json({
      ...newComment,
      author,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Create comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete comment (author or admin only)
router.delete("/comments/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id))
      .limit(1);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const isAuthor = comment.authorId === req.user!.id;
    const isAdmin = req.user!.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    await db.delete(comments).where(eq(comments.id, id));

    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Report content
router.post("/reports", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = insertReportSchema.parse({
      ...req.body,
      reporterId: req.user!.id,
    });

    const [newReport] = await db
      .insert(reports)
      .values(validatedData)
      .returning();

    res.status(201).json(newReport);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Report error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
