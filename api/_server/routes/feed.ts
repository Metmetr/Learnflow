import { Router, type Response } from "express";
import { db } from "../db";
import { content, users } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { optionalAuth, type AuthRequest } from "../auth";

const router = Router();

function rankItems(items: any[], userTopics: string[] = []): any[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  const maxPopularity = Math.max(...items.map((i: any) => i.popularity || 0), 1);
  const now = new Date();

  const rankedItems = items.map((item: any) => {
    let score = 0;

    score += 2.0;

    const itemTopics = item.topics || [];
    const matchingTopics = userTopics.filter((t: string) =>
      itemTopics.includes(t)
    );
    score += matchingTopics.length * 1.5;

    const normalizedPopularity = (item.popularity || 0) / maxPopularity;
    score += normalizedPopularity * 1.0;

    const createdAt = new Date(item.createdAt);
    const ageDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    score -= ageDays * 0.01;

    return {
      ...item,
      score: Math.max(score, 0),
    };
  });

  rankedItems.sort((a, b) => b.score - a.score);

  return rankedItems;
}

router.post("/ml/rank", async (req, res: Response) => {
  try {
    const { userId, userTopics = [], items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Items array required" });
    }

    const rankedItems = rankItems(items, userTopics);
    res.json(rankedItems);
  } catch (error) {
    console.error("ML rank error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/personalized", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { limit = "20", offset = "0" } = req.query;
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    const results = await db
      .select({
        id: content.id,
        title: content.title,
        excerpt: content.excerpt,
        mediaUrl: content.mediaUrl,
        topics: content.topics,
        source: content.source,
        authorId: content.authorId,
        authorName: users.name,
        authorAvatar: users.avatar,
        createdAt: content.createdAt,
        popularity: content.popularity,
      })
      .from(content)
      .innerJoin(users, eq(content.authorId, users.id))
      .orderBy(desc(content.createdAt))
      .limit(100);

    const userTopics: string[] = [];

    const enrichedItems = await Promise.all(
      results.map(async (item) => {
        const likeResult = await db.execute<{ likeCount: number }>(sql`
          SELECT COUNT(*)::int as "likeCount"
          FROM likes
          WHERE content_id = ${item.id}
        `);
        const likeCount = likeResult.rows[0]?.likeCount || 0;

        const commentResult = await db.execute<{ commentCount: number }>(sql`
          SELECT COUNT(*)::int as "commentCount"
          FROM comments
          WHERE content_id = ${item.id}
        `);
        const commentCount = commentResult.rows[0]?.commentCount || 0;

        let isLiked = false;
        let isBookmarked = false;
        if (req.user) {
          const likedResult = await db.execute<{ liked: number }>(sql`
            SELECT COUNT(*)::int as liked
            FROM likes
            WHERE content_id = ${item.id} AND user_id = ${req.user.id}
          `);
          isLiked = (likedResult.rows[0]?.liked || 0) > 0;

          const bookmarkedResult = await db.execute<{ bookmarked: number }>(sql`
            SELECT COUNT(*)::int as bookmarked
            FROM bookmarks
            WHERE content_id = ${item.id} AND user_id = ${req.user.id}
          `);
          isBookmarked = (bookmarkedResult.rows[0]?.bookmarked || 0) > 0;
        }

        const isJarvis = item.source === "jarvis" || item.source === "n8n";

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
            isBot: isJarvis,
          },
          createdAt: item.createdAt,
          popularity: item.popularity,
          likes: likeCount,
          comments: commentCount,
          isLiked,
          isBookmarked,
        };
      })
    );

    const rankedItems = rankItems(enrichedItems, userTopics);
    const paginatedItems = rankedItems.slice(offsetNum, offsetNum + limitNum);

    res.json(paginatedItems);
  } catch (error) {
    console.error("Personalized feed error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
