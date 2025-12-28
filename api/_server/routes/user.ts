import { Router, type Response } from "express";
import { db } from "../db";
import { content, users } from "../../../shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { isAuthenticated as authenticateToken, type AuthRequest } from "../auth";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

const updateProfileSchema = z.object({
  specialty: z.string().max(100).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  education: z.string().max(100).nullable().optional(),
  website: z.string().max(255).nullable().optional(),
  githubHandle: z.string().max(100).nullable().optional(),
  twitterHandle: z.string().max(100).nullable().optional(),
  linkedinHandle: z.string().max(100).nullable().optional(),
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

    // 1. Total Bookmarks (Saved Posts)
    const totalBookmarksResult = await db.execute<{ totalBookmarks: number }>(sql`
      SELECT COUNT(*)::int as "totalBookmarks"
      FROM bookmarks
      WHERE user_id = ${userId}
    `);

    // 2. Total Liked Posts
    const totalLikedPostsResult = await db.execute<{ totalLikedPosts: number }>(sql`
      SELECT COUNT(*)::int as "totalLikedPosts"
      FROM likes
      WHERE user_id = ${userId}
    `);

    // 3. Total Comments Made
    const totalCommentsMadeResult = await db.execute<{ totalCommentsMade: number }>(sql`
      SELECT COUNT(*)::int as "totalCommentsMade"
      FROM comments
      WHERE author_id = ${userId}
    `);

    res.json({
      totalBookmarks: totalBookmarksResult.rows[0]?.totalBookmarks || 0,
      totalLikedPosts: totalLikedPostsResult.rows[0]?.totalLikedPosts || 0,
      totalCommentsMade: totalCommentsMadeResult.rows[0]?.totalCommentsMade || 0,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

export default router;
