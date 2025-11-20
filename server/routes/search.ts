import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { content, users } from "@shared/schema";
import { or, ilike, sql, eq, and } from "drizzle-orm";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      return res.json([]);
    }

    const searchTerm = `%${query.trim()}%`;

    // Search in title, body, and topics (only verified content)
    const results = await db
      .select({
        id: content.id,
        title: content.title,
        excerpt: content.excerpt,
        mediaUrl: content.mediaUrl,
        topics: content.topics,
        createdAt: content.createdAt,
        authorId: users.id,
        authorName: users.name,
        authorAvatar: users.avatar,
        authorVerified: users.verified,
      })
      .from(content)
      .innerJoin(users, eq(content.authorId, users.id))
      .where(
        and(
          eq(content.verificationStatus, "verified"),
          or(
            ilike(content.title, searchTerm),
            ilike(content.body, searchTerm),
            sql`EXISTS (
              SELECT 1 FROM unnest(${content.topics}) AS topic
              WHERE topic ILIKE ${searchTerm}
            )`
          )
        )
      )
      .limit(50);

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
