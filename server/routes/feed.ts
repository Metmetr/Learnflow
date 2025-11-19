import { Router, type Response } from "express";
import { db } from "../db";
import { content, users } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { optionalAuth, type AuthRequest } from "../auth";

const router = Router();

// Mock ML ranker endpoint
// TODO: Replace with actual ML model (FastAPI microservice with sklearn/pytorch)
router.post("/ml/rank", async (req, res: Response) => {
  try {
    const { userId, userTopics = [], items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Items array required" });
    }

    // Scoring algorithm:
    // - Verified content: +2 points
    // - Topic match: +1.5 points per matching topic
    // - Popularity: normalized (0-1) * 1 point
    // - Age penalty: -0.01 per day old

    const maxPopularity = Math.max(...items.map((i: any) => i.popularity || 0), 1);
    const now = new Date();

    const rankedItems = items.map((item: any) => {
      let score = 0;

      // Verification bonus
      if (item.verified || item.verificationStatus === "verified") {
        score += 2.0;
      }

      // Topic matching
      const itemTopics = item.topics || [];
      const matchingTopics = userTopics.filter((t: string) =>
        itemTopics.includes(t)
      );
      score += matchingTopics.length * 1.5;

      // Popularity (normalized)
      const normalizedPopularity = (item.popularity || 0) / maxPopularity;
      score += normalizedPopularity * 1.0;

      // Age penalty
      const createdAt = new Date(item.createdAt);
      const ageDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      score -= ageDays * 0.01;

      return {
        ...item,
        score: Math.max(score, 0), // Prevent negative scores
        scoreBreakdown: {
          verified: item.verified || item.verificationStatus === "verified" ? 2.0 : 0,
          topicMatch: matchingTopics.length * 1.5,
          popularity: normalizedPopularity * 1.0,
          agePenalty: -(ageDays * 0.01),
        },
      };
    });

    // Sort by score descending
    rankedItems.sort((a, b) => b.score - a.score);

    res.json(rankedItems);
  } catch (error) {
    console.error("ML rank error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Personalized feed endpoint
router.get("/personalized", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { limit = "20", offset = "0" } = req.query;
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    // Get verified content
    const results = await db
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
      .limit(100); // Get more items for ranking

    // If user is logged in, get their topic preferences
    // TODO: Implement user topic preferences tracking
    const userTopics: string[] = [];

    // Enrich with stats
    const enrichedItems = await Promise.all(
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
          verified: item.verificationStatus === "verified",
          popularity: item.popularity,
          likes: likeCount,
          comments: commentCount,
          isLiked,
          isBookmarked,
        };
      })
    );

    // Rank items using ML algorithm
    const response = await fetch(`${req.protocol}://${req.get("host")}/api/feed/ml/rank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: req.user?.id,
        userTopics,
        items: enrichedItems,
      }),
    });

    if (!response.ok) {
      throw new Error("ML ranking failed");
    }

    const rankedItems = await response.json();

    // Apply pagination
    const paginatedItems = rankedItems.slice(offsetNum, offsetNum + limitNum);

    res.json(paginatedItems);
  } catch (error) {
    console.error("Personalized feed error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
