import { Router, type Response } from "express";
import { db } from "../db";
import { content, users, reports, sheeridVerifications } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { authenticateToken, requireRole, type AuthRequest } from "../auth";

const router = Router();

// All admin routes require admin role
router.use(authenticateToken);
router.use(requireRole("admin"));

// Get pending content for moderation
router.get("/moderation/pending", async (req: AuthRequest, res: Response) => {
  try {
    const pendingContent = await db
      .select({
        id: content.id,
        title: content.title,
        excerpt: content.excerpt,
        topics: content.topics,
        createdAt: content.createdAt,
        authorId: users.id,
        authorName: users.name,
        authorEmail: users.email,
      })
      .from(content)
      .innerJoin(users, eq(content.authorId, users.id))
      .where(eq(content.verificationStatus, "pending"))
      .orderBy(desc(content.createdAt));

    res.json(pendingContent);
  } catch (error) {
    console.error("Get pending content error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Approve content
router.post("/moderation/approve/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [updated] = await db
      .update(content)
      .set({
        verificationStatus: "verified",
        verifiedBy: req.user!.id,
        verifiedAt: new Date(),
      })
      .where(eq(content.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Approve content error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reject content
router.post("/moderation/reject/:id", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [updated] = await db
      .update(content)
      .set({
        verificationStatus: "rejected",
        verifiedBy: req.user!.id,
        verifiedAt: new Date(),
      })
      .where(eq(content.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Reject content error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all reports
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

// Resolve report
router.post("/reports/:id/resolve", async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [updated] = await db
      .update(reports)
      .set({
        status: "verified", // Using verified to mean resolved
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

// Get SheerID verifications
router.get("/sheerid/verifications", async (req: AuthRequest, res: Response) => {
  try {
    const verifications = await db
      .select({
        id: sheeridVerifications.id,
        verificationId: sheeridVerifications.verificationId,
        status: sheeridVerifications.status,
        createdAt: sheeridVerifications.createdAt,
        verifiedAt: sheeridVerifications.verifiedAt,
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
      })
      .from(sheeridVerifications)
      .innerJoin(users, eq(sheeridVerifications.userId, users.id))
      .orderBy(desc(sheeridVerifications.createdAt));

    res.json(verifications);
  } catch (error) {
    console.error("Get SheerID verifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Manually verify educator (admin override)
router.post("/sheerid/verify/:userId", async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Update user role to educator
    const [updated] = await db
      .update(users)
      .set({
        role: "educator",
        verified: true,
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update any pending verification
    await db
      .update(sheeridVerifications)
      .set({
        status: "verified",
        verifiedAt: new Date(),
      })
      .where(eq(sheeridVerifications.userId, userId));

    res.json(updated);
  } catch (error) {
    console.error("Manual verify educator error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get dashboard stats
router.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    const [{ totalUsers }] = await db.execute<{ totalUsers: number }>(sql`
      SELECT COUNT(*)::int as "totalUsers" FROM users
    `);

    const [{ totalContent }] = await db.execute<{ totalContent: number }>(sql`
      SELECT COUNT(*)::int as "totalContent" FROM content WHERE verification_status = 'verified'
    `);

    const [{ pendingContent }] = await db.execute<{ pendingContent: number }>(sql`
      SELECT COUNT(*)::int as "pendingContent" FROM content WHERE verification_status = 'pending'
    `);

    const [{ educatorCount }] = await db.execute<{ educatorCount: number }>(sql`
      SELECT COUNT(*)::int as "educatorCount" FROM users WHERE role = 'educator'
    `);

    const [{ pendingReports }] = await db.execute<{ pendingReports: number }>(sql`
      SELECT COUNT(*)::int as "pendingReports" FROM reports WHERE status = 'pending'
    `);

    res.json({
      totalUsers,
      totalContent,
      pendingContent,
      educatorCount,
      pendingReports,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
