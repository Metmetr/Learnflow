import { Router, type Response } from "express";
import { db } from "../db";
import { content, users, reports } from "../../../shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { isAuthenticated as authenticateToken, requireRole, type AuthRequest } from "../auth";

const router = Router();

router.use(authenticateToken);
router.use(requireRole("admin"));

router.get("/reports", async (req: AuthRequest, res: Response) => {
  try {
    const allReports = await db
      .select({
        id: reports.id,
        reason: reports.reason,
        status: reports.status,
        createdAt: reports.createdAt,
        contentId: content.id,
        contentTitle: content.title,
        reporterId: users.id,
        reporterName: users.name,
        reporterEmail: users.email,
      })
      .from(reports)
      .innerJoin(content, eq(reports.contentId, content.id))
      .innerJoin(users, eq(reports.reporterId, users.id))
      .orderBy(desc(reports.createdAt));

    res.json(allReports);
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reports/:id/resolve", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [updated] = await db
      .update(reports)
      .set({
        status: "verified",
        resolvedBy: req.user!.id,
        resolvedAt: new Date(),
      })
      .where(eq(reports.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Resolve report error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/content/:id", async (req: AuthRequest, res: Response) => {
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
});

router.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    const usersResult = await db.execute<{ totalUsers: number }>(sql`
      SELECT COUNT(*)::int as "totalUsers" FROM users WHERE role != 'admin'
    `);
    const totalUsers = usersResult.rows[0]?.totalUsers || 0;

    const contentResult = await db.execute<{ totalContent: number }>(sql`
      SELECT COUNT(*)::int as "totalContent" FROM content
    `);
    const totalContent = contentResult.rows[0]?.totalContent || 0;

    const jarvisResult = await db.execute<{ jarvisContent: number }>(sql`
      SELECT COUNT(*)::int as "jarvisContent" FROM content WHERE source IN ('jarvis', 'n8n')
    `);
    const jarvisContent = jarvisResult.rows[0]?.jarvisContent || 0;

    const likesResult = await db.execute<{ totalLikes: number }>(sql`
      SELECT COUNT(*)::int as "totalLikes" FROM likes
    `);
    const totalLikes = likesResult.rows[0]?.totalLikes || 0;

    const commentsResult = await db.execute<{ totalComments: number }>(sql`
      SELECT COUNT(*)::int as "totalComments" FROM comments
    `);
    const totalComments = commentsResult.rows[0]?.totalComments || 0;

    const reportsResult = await db.execute<{ pendingReports: number }>(sql`
      SELECT COUNT(*)::int as "pendingReports" FROM reports WHERE status = 'pending'
    `);
    const pendingReports = reportsResult.rows[0]?.pendingReports || 0;

    res.json({
      totalUsers,
      totalContent,
      jarvisContent,
      totalLikes,
      totalComments,
      pendingReports,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users", async (req: AuthRequest, res: Response) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        avatar: users.avatar,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    res.json(allUsers);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/content", async (req: AuthRequest, res: Response) => {
  try {
    const allContent = await db
      .select({
        id: content.id,
        title: content.title,
        excerpt: content.excerpt,
        topics: content.topics,
        source: content.source,
        createdAt: content.createdAt,
        authorId: users.id,
        authorName: users.name,
      })
      .from(content)
      .innerJoin(users, eq(content.authorId, users.id))
      .orderBy(desc(content.createdAt));

    res.json(allContent);
  } catch (error) {
    console.error("Get all content error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
