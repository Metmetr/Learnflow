import { Router, type Response } from "express";
import { db } from "../db";
import { content, users } from "@shared/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { isAuthenticated as authenticateToken, optionalAuth, requireRole, type AuthRequest } from "../replitAuth";
import { insertContentSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get all verified content (public feed)
router.get("/", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { topic, limit = "20", offset = "0" } = req.query;
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    let query = db
      .select({
        id: content.id,
        title: content.title,
        excerpt: content.excerpt,
        mediaUrl: content.mediaUrl,
        topics: content.topics,
        authorId: content.authorId,
        authorName: users.name,
        authorAvatar: users.avatar,
        authorVerified: users.verified,
        verificationStatus: content.verificationStatus,
        createdAt: content.createdAt,
        popularity: content.popularity,
      })
      .from(content)
      .innerJoin(users, eq(content.authorId, users.id))
      .where(eq(content.verificationStatus, "verified"))
      .orderBy(desc(content.createdAt))
      .limit(limitNum)
      .offset(offsetNum);

    // Filter by topic if specified
    if (topic && typeof topic === "string") {
      query = query.where(
        and(
          eq(content.verificationStatus, "verified"),
          sql`${content.topics} && ARRAY[${topic}]::text[]`
        )
      );
    }

    const results = await query;

    // Get like counts and comment counts for each content
    const enrichedResults = await Promise.all(
      results.map(async (item) => {
        const [{ likeCount }] = await db.execute<{ likeCount: number }>(sql`
          SELECT COUNT(*)::int as "likeCount"
          FROM likes
          WHERE content_id = ${item.id}
        `);

        const [{ commentCount }] = await db.execute<{ commentCount: number }>(sql`
          SELECT COUNT(*)::int as "commentCount"
          FROM comments
          WHERE content_id = ${item.id}
        `);

        // Check if current user liked or bookmarked
        let isLiked = false;
        let isBookmarked = false;
        if (req.user) {
          const [{ liked }] = await db.execute<{ liked: number }>(sql`
            SELECT COUNT(*)::int as liked
            FROM likes
            WHERE content_id = ${item.id} AND user_id = ${req.user.id}
          `);
          isLiked = liked > 0;

          const [{ bookmarked }] = await db.execute<{ bookmarked: number }>(sql`
            SELECT COUNT(*)::int as bookmarked
            FROM bookmarks
            WHERE content_id = ${item.id} AND user_id = ${req.user.id}
          `);
          isBookmarked = bookmarked > 0;
        }

        return {
          id: item.id,
          title: item.title,
          excerpt: item.excerpt,
          mediaUrl: item.mediaUrl,
          topics: item.topics,
          author: {
            id: item.authorId,
            name: item.authorName,
            avatar: item.authorAvatar,
            verified: item.authorVerified,
          },
          createdAt: item.createdAt,
          verificationStatus: item.verificationStatus,
          likes: likeCount,
          comments: commentCount,
          isLiked,
          isBookmarked,
        };
      })
    );

    res.json(enrichedResults);
  } catch (error) {
    console.error("Get content error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get single content by ID
router.get("/:id", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await db
      .select({
        id: content.id,
        title: content.title,
        body: content.body,
        excerpt: content.excerpt,
        mediaUrl: content.mediaUrl,
        topics: content.topics,
        type: content.type,
        authorId: content.authorId,
        authorName: users.name,
        authorAvatar: users.avatar,
        authorVerified: users.verified,
        authorSpecialty: users.specialty,
        verificationStatus: content.verificationStatus,
        createdAt: content.createdAt,
        popularity: content.popularity,
      })
      .from(content)
      .innerJoin(users, eq(content.authorId, users.id))
      .where(eq(content.id, id))
      .limit(1);

    if (!result) {
      return res.status(404).json({ error: "Content not found" });
    }

    // Get stats
    const [{ likeCount }] = await db.execute<{ likeCount: number }>(sql`
      SELECT COUNT(*)::int as "likeCount"
      FROM likes
      WHERE content_id = ${id}
    `);

    const [{ commentCount }] = await db.execute<{ commentCount: number }>(sql`
      SELECT COUNT(*)::int as "commentCount"
      FROM comments
      WHERE content_id = ${id}
    `);

    let isLiked = false;
    let isBookmarked = false;
    if (req.user) {
      const [{ liked }] = await db.execute<{ liked: number }>(sql`
        SELECT COUNT(*)::int as liked
        FROM likes
        WHERE content_id = ${id} AND user_id = ${req.user.id}
      `);
      isLiked = liked > 0;

      const [{ bookmarked }] = await db.execute<{ bookmarked: number }>(sql`
        SELECT COUNT(*)::int as bookmarked
        FROM bookmarks
        WHERE content_id = ${id} AND user_id = ${req.user.id}
      `);
      isBookmarked = bookmarked > 0;
    }

    res.json({
      ...result,
      author: {
        id: result.authorId,
        name: result.authorName,
        avatar: result.authorAvatar,
        verified: result.authorVerified,
        specialty: result.authorSpecialty,
      },
      likes: likeCount,
      comments: commentCount,
      isLiked,
      isBookmarked,
    });
  } catch (error) {
    console.error("Get content by ID error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new content (educator and admin only)
router.post(
  "/",
  authenticateToken,
  requireRole("educator", "admin"),
  async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = insertContentSchema.parse({
        ...req.body,
        authorId: req.user!.id,
        verificationStatus: "pending",
        source: "user",
      });

      const [newContent] = await db
        .insert(content)
        .values(validatedData)
        .returning();

      res.status(201).json(newContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create content error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Update content (author or admin only)
router.patch(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const [existingContent] = await db
        .select()
        .from(content)
        .where(eq(content.id, id))
        .limit(1);

      if (!existingContent) {
        return res.status(404).json({ error: "Content not found" });
      }

      // Check permissions
      const isAuthor = existingContent.authorId === req.user!.id;
      const isAdmin = req.user!.role === "admin";

      if (!isAuthor && !isAdmin) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const { title, body, excerpt, topics, mediaUrl } = req.body;

      const [updated] = await db
        .update(content)
        .set({
          title,
          body,
          excerpt,
          topics,
          mediaUrl,
          updatedAt: new Date(),
        })
        .where(eq(content.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Update content error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete content (author or admin only)
router.delete(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const [existingContent] = await db
        .select()
        .from(content)
        .where(eq(content.id, id))
        .limit(1);

      if (!existingContent) {
        return res.status(404).json({ error: "Content not found" });
      }

      const isAuthor = existingContent.authorId === req.user!.id;
      const isAdmin = req.user!.role === "admin";

      if (!isAuthor && !isAdmin) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      await db.delete(content).where(eq(content.id, id));

      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      console.error("Delete content error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get user's bookmarked content
router.get(
  "/bookmarks/my",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const results = await db.execute(sql`
        SELECT 
          c.id,
          c.title,
          c.excerpt,
          c.media_url as "mediaUrl",
          c.topics,
          c.created_at as "createdAt",
          u.id as "authorId",
          u.name as "authorName",
          u.avatar as "authorAvatar",
          u.verified as "authorVerified"
        FROM bookmarks b
        INNER JOIN content c ON b.content_id = c.id
        INNER JOIN users u ON c.author_id = u.id
        WHERE b.user_id = ${req.user!.id}
        ORDER BY b.created_at DESC
      `);

      res.json(results.rows);
    } catch (error) {
      console.error("Get bookmarks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
