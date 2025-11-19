import { Router, type Response } from "express";
import { db } from "../db";
import { likes, bookmarks, comments, reports, users } from "@shared/schema";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { isAuthenticated as authenticateToken, type AuthRequest } from "../replitAuth";
import {
  insertLikeSchema,
  insertBookmarkSchema,
  insertCommentSchema,
  insertReportSchema,
} from "@shared/schema";
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
      .select({
        id: comments.id,
        contentId: comments.contentId,
        body: comments.body,
        createdAt: comments.createdAt,
        parentId: comments.parentId,
        authorId: users.id,
        authorName: users.name,
        authorAvatar: users.avatar,
      })
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.contentId, contentId))
      .orderBy(desc(comments.createdAt));

    // Organize into nested structure
    const commentMap = new Map();
    const topLevel: any[] = [];

    allComments.forEach((comment) => {
      const formatted = {
        id: comment.id,
        author: {
          id: comment.authorId,
          name: comment.authorName,
          avatar: comment.authorAvatar,
        },
        content: comment.body,
        createdAt: comment.createdAt,
        replies: [],
      };
      commentMap.set(comment.id, formatted);

      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(formatted);
        }
      } else {
        topLevel.push(formatted);
      }
    });

    res.json(topLevel);
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

    const [newComment] = await db
      .insert(comments)
      .values(validatedData)
      .returning();

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
