import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { content, users } from "../../../shared/schema";
import { or, ilike, sql, eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      return res.json([]);
    }

    const searchTerm = `%${query.trim()}%`;

    const results = await db
      .select({
        id: content.id,
        title: content.title,
        excerpt: content.excerpt,
        mediaUrl: content.mediaUrl,
        topics: content.topics,
        source: content.source,
        createdAt: content.createdAt,
        authorId: users.id,
        authorName: users.name,
        authorAvatar: users.avatar,
      })
      .from(content)
      .innerJoin(users, eq(content.authorId, users.id))
      .where(
        or(
          ilike(content.title, searchTerm),
          ilike(content.body, searchTerm),
          sql`EXISTS (
            SELECT 1 FROM unnest(${content.topics}) AS topic
            WHERE topic ILIKE ${searchTerm}
          )`
        )
      )
      .limit(50);

    const enrichedResults = results.map(item => ({
      ...item,
      author: {
        id: item.authorId,
        name: item.authorName,
        avatar: item.authorAvatar,
        isBot: item.source === "jarvis" || item.source === "n8n",
      }
    }));

    res.json(enrichedResults);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
