import { Router, type Response } from "express";
import { db } from "../db";
import { content, users } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { isAuthenticated as authenticateToken, type AuthRequest } from "../auth";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

const updateProfileSchema = z.object({
  specialty: z.string().max(100).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
});

router.put("/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const validated = updateProfileSchema.parse(req.body);

    const updatedUser = await storage.updateUserProfile(userId, validated);
    res.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

router.get("/content", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const userContent = await db
      .select({
        id: content.id,
        title: content.title,
        excerpt: content.excerpt,
        mediaUrl: content.mediaUrl,
        topics: content.topics,
        verificationStatus: content.verificationStatus,
        createdAt: content.createdAt,
        popularity: content.popularity,
      })
      .from(content)
      .where(eq(content.authorId, userId))
      .orderBy(desc(content.createdAt));

    const enrichedContent = await Promise.all(
      userContent.map(async (item) => {
        const likeCountResult = await db.execute<{ likeCount: number }>(sql`
          SELECT COUNT(*)::int as "likeCount"
          FROM likes
          WHERE content_id = ${item.id}
        `);

        const commentCountResult = await db.execute<{ commentCount: number }>(sql`
          SELECT COUNT(*)::int as "commentCount"
          FROM comments
          WHERE content_id = ${item.id}
        `);

        return {
          ...item,
          likeCount: likeCountResult.rows[0]?.likeCount || 0,
          commentCount: commentCountResult.rows[0]?.commentCount || 0,
        };
      })
    );

    res.json(enrichedContent);
  } catch (error) {
    console.error("Error fetching user content:", error);
    res.status(500).json({ message: "Failed to fetch content" });
  }
});

router.get("/stats", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const totalContentResult = await db.execute<{ totalContent: number }>(sql`
      SELECT COUNT(*)::int as "totalContent"
      FROM content
      WHERE author_id = ${userId}
    `);

    const verifiedContentResult = await db.execute<{ verifiedContent: number }>(sql`
      SELECT COUNT(*)::int as "verifiedContent"
      FROM content
      WHERE author_id = ${userId} AND verification_status = 'verified'
    `);

    const totalLikesResult = await db.execute<{ totalLikes: number }>(sql`
      SELECT COALESCE(SUM(like_count), 0)::int as "totalLikes"
      FROM (
        SELECT COUNT(*) as like_count
        FROM likes l
        INNER JOIN content c ON l.content_id = c.id
        WHERE c.author_id = ${userId}
        GROUP BY l.content_id
      ) counts
    `);

    const totalCommentsResult = await db.execute<{ totalComments: number }>(sql`
      SELECT COALESCE(COUNT(*), 0)::int as "totalComments"
      FROM comments co
      INNER JOIN content c ON co.content_id = c.id
      WHERE c.author_id = ${userId}
    `);

    res.json({
      totalContent: totalContentResult.rows[0]?.totalContent || 0,
      verifiedContent: verifiedContentResult.rows[0]?.verifiedContent || 0,
      totalLikes: totalLikesResult.rows[0]?.totalLikes || 0,
      totalComments: totalCommentsResult.rows[0]?.totalComments || 0,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

export default router;
