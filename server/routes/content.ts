import { Router, type Response } from "express";
import { db } from "../db";
import { content, users } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { isAuthenticated as authenticateToken, optionalAuth, requireRole, type AuthRequest } from "../replitAuth";

const router = Router();

router.get("/", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { topic, limit = "20", offset = "0" } = req.query;
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    let baseQuery = db
      .select({
        id: content.id,
        title: content.title,
        excerpt: content.excerpt,
        mediaUrl: content.mediaUrl,
        topics: content.topics,
        authorId: content.authorId,
        authorName: users.name,
        authorAvatar: users.avatar,
        source: content.source,
        createdAt: content.createdAt,
        popularity: content.popularity,
      })
      .from(content)
      .innerJoin(users, eq(content.authorId, users.id))
      .orderBy(desc(content.createdAt))
      .limit(limitNum)
      .offset(offsetNum);

    let results;
    if (topic && typeof topic === "string") {
      results = await db
        .select({
          id: content.id,
          title: content.title,
          excerpt: content.excerpt,
          mediaUrl: content.mediaUrl,
          topics: content.topics,
          authorId: content.authorId,
          authorName: users.name,
          authorAvatar: users.avatar,
          source: content.source,
          createdAt: content.createdAt,
          popularity: content.popularity,
        })
        .from(content)
        .innerJoin(users, eq(content.authorId, users.id))
        .where(sql`${content.topics} && ARRAY[${topic}]::text[]`)
        .orderBy(desc(content.createdAt))
        .limit(limitNum)
        .offset(offsetNum);
    } else {
      results = await baseQuery;
    }

    const enrichedResults = await Promise.all(
      results.map(async (item) => {
        const likeResult = await db.execute(sql`
          SELECT COUNT(*)::int as "likeCount"
          FROM likes
          WHERE content_id = ${item.id}
        `);
        const likeCount = (likeResult.rows[0] as any)?.likeCount ?? 0;

        const commentResult = await db.execute(sql`
          SELECT COUNT(*)::int as "commentCount"
          FROM comments
          WHERE content_id = ${item.id}
        `);
        const commentCount = (commentResult.rows[0] as any)?.commentCount ?? 0;

        let isLiked = false;
        let isBookmarked = false;
        if (req.user) {
          const likedResult = await db.execute(sql`
            SELECT COUNT(*)::int as liked
            FROM likes
            WHERE content_id = ${item.id} AND user_id = ${req.user.id}
          `);
          isLiked = ((likedResult.rows[0] as any)?.liked ?? 0) > 0;

          const bookmarkedResult = await db.execute(sql`
            SELECT COUNT(*)::int as bookmarked
            FROM bookmarks
            WHERE content_id = ${item.id} AND user_id = ${req.user.id}
          `);
          isBookmarked = ((bookmarkedResult.rows[0] as any)?.bookmarked ?? 0) > 0;
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
        source: content.source,
        authorId: content.authorId,
        authorName: users.name,
        authorAvatar: users.avatar,
        authorSpecialty: users.specialty,
        authorBio: users.bio,
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

    const likeResult = await db.execute(sql`
      SELECT COUNT(*)::int as "likeCount"
      FROM likes
      WHERE content_id = ${id}
    `);
    const likeCount = (likeResult.rows[0] as any)?.likeCount ?? 0;

    const commentResult = await db.execute(sql`
      SELECT COUNT(*)::int as "commentCount"
      FROM comments
      WHERE content_id = ${id}
    `);
    const commentCount = (commentResult.rows[0] as any)?.commentCount ?? 0;

    let isLiked = false;
    let isBookmarked = false;
    if (req.user) {
      const likedResult = await db.execute(sql`
        SELECT COUNT(*)::int as liked
        FROM likes
        WHERE content_id = ${id} AND user_id = ${req.user.id}
      `);
      isLiked = ((likedResult.rows[0] as any)?.liked ?? 0) > 0;

      const bookmarkedResult = await db.execute(sql`
        SELECT COUNT(*)::int as bookmarked
        FROM bookmarks
        WHERE content_id = ${id} AND user_id = ${req.user.id}
      `);
      isBookmarked = ((bookmarkedResult.rows[0] as any)?.bookmarked ?? 0) > 0;
    }

    const isJarvis = result.source === "jarvis" || result.source === "n8n";

    res.json({
      id: result.id,
      title: result.title,
      body: result.body,
      excerpt: result.excerpt,
      mediaUrl: result.mediaUrl,
      topics: result.topics,
      type: result.type,
      author: {
        id: result.authorId,
        name: result.authorName,
        avatar: result.authorAvatar,
        specialty: result.authorSpecialty,
        bio: result.authorBio,
        isBot: isJarvis,
      },
      createdAt: result.createdAt,
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

router.delete(
  "/:id",
  authenticateToken,
  requireRole("admin"),
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

      await db.delete(content).where(eq(content.id, id));

      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      console.error("Delete content error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

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
          c.source,
          c.created_at as "createdAt",
          u.id as "authorId",
          u.name as "authorName",
          u.avatar as "authorAvatar",
          (SELECT COUNT(*)::int FROM likes WHERE content_id = c.id) as "likeCount",
          (SELECT COUNT(*)::int FROM comments WHERE content_id = c.id) as "commentCount"
        FROM bookmarks b
        INNER JOIN content c ON b.content_id = c.id
        INNER JOIN users u ON c.author_id = u.id
        WHERE b.user_id = ${req.user!.id}
        ORDER BY b.created_at DESC
      `);

      const enrichedResults = await Promise.all(
        (results.rows as any[]).map(async (item) => {
          const likedResult = await db.execute(sql`
            SELECT COUNT(*)::int as liked FROM likes 
            WHERE content_id = ${item.id} AND user_id = ${req.user!.id}
          `);
          const liked = (likedResult.rows[0] as any)?.liked ?? 0;

          return {
            id: item.id,
            title: item.title,
            excerpt: item.excerpt,
            mediaUrl: item.mediaUrl,
            topics: item.topics,
            createdAt: item.createdAt,
            author: {
              id: item.authorId,
              name: item.authorName,
              avatar: item.authorAvatar,
              isBot: item.source === "jarvis" || item.source === "n8n",
            },
            likes: item.likeCount,
            comments: item.commentCount,
            isLiked: liked > 0,
            isBookmarked: true,
          };
        })
      );

      res.json(enrichedResults);
    } catch (error) {
      console.error("Get bookmarks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get(
  "/likes/my",
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
          c.source,
          c.created_at as "createdAt",
          u.id as "authorId",
          u.name as "authorName",
          u.avatar as "authorAvatar",
          (SELECT COUNT(*)::int FROM likes WHERE content_id = c.id) as "likeCount",
          (SELECT COUNT(*)::int FROM comments WHERE content_id = c.id) as "commentCount"
        FROM likes l
        INNER JOIN content c ON l.content_id = c.id
        INNER JOIN users u ON c.author_id = u.id
        WHERE l.user_id = ${req.user!.id}
        ORDER BY l.created_at DESC
      `);

      const enrichedResults = await Promise.all(
        (results.rows as any[]).map(async (item) => {
          const bookmarkedResult = await db.execute(sql`
            SELECT COUNT(*)::int as bookmarked FROM bookmarks 
            WHERE content_id = ${item.id} AND user_id = ${req.user!.id}
          `);
          const bookmarked = (bookmarkedResult.rows[0] as any)?.bookmarked ?? 0;

          return {
            id: item.id,
            title: item.title,
            excerpt: item.excerpt,
            mediaUrl: item.mediaUrl,
            topics: item.topics,
            createdAt: item.createdAt,
            author: {
              id: item.authorId,
              name: item.authorName,
              avatar: item.authorAvatar,
              isBot: item.source === "jarvis" || item.source === "n8n",
            },
            likes: item.likeCount,
            comments: item.commentCount,
            isLiked: true,
            isBookmarked: bookmarked > 0,
          };
        })
      );

      res.json(enrichedResults);
    } catch (error) {
      console.error("Get likes error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
