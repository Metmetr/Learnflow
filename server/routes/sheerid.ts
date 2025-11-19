import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { sheeridVerifications, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../auth";

const router = Router();

// TODO: Start SheerID verification flow
// INTEGRATION NOTE: This would initiate SheerID verification process
// For now, creating a placeholder verification record
router.post("/start", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!process.env.SHEERID_CLIENT_ID) {
      return res.status(501).json({
        error: "SheerID not configured",
        message: "SheerID integration requires SHEERID_CLIENT_ID environment variable",
      });
    }

    // TODO: Call SheerID API to start verification
    // For now, create a pending verification record
    const mockVerificationId = `SID-${Date.now()}`;

    const [verification] = await db
      .insert(sheeridVerifications)
      .values({
        userId: req.user!.id,
        verificationId: mockVerificationId,
        status: "pending",
        verificationData: {
          initiated: new Date().toISOString(),
          // TODO: Store SheerID response data
        },
      })
      .returning();

    res.json({
      verificationId: verification.verificationId,
      status: verification.status,
      message: "Verification initiated. Please complete the SheerID verification process.",
      // TODO: Return SheerID verification URL
    });
  } catch (error) {
    console.error("Start SheerID verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// TODO: SheerID webhook handler
// SECURITY NOTE: This endpoint should verify webhook signature
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.SHEERID_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("SHEERID_WEBHOOK_SECRET not configured");
      return res.status(500).json({ error: "Webhook not configured" });
    }

    // TODO: Verify webhook signature
    // const signature = req.headers['x-sheerid-signature'];
    // if (!verifySheerIDSignature(signature, webhookSecret, req.body)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    const { verificationId, status, personData } = req.body;

    if (!verificationId || !status) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    // Find verification record
    const [verification] = await db
      .select()
      .from(sheeridVerifications)
      .where(eq(sheeridVerifications.verificationId, verificationId))
      .limit(1);

    if (!verification) {
      return res.status(404).json({ error: "Verification not found" });
    }

    // Update verification status
    const verificationStatus = status === "success" ? "verified" : "rejected";

    await db
      .update(sheeridVerifications)
      .set({
        status: verificationStatus,
        verifiedAt: verificationStatus === "verified" ? new Date() : null,
        verificationData: {
          ...verification.verificationData,
          webhookReceived: new Date().toISOString(),
          status,
          // TODO: Redact PII before storing
          // Store only verification ID and non-sensitive metadata
        },
      })
      .where(eq(sheeridVerifications.id, verification.id));

    // If verified, upgrade user to educator role
    if (verificationStatus === "verified") {
      await db
        .update(users)
        .set({
          role: "educator",
          verified: true,
        })
        .where(eq(users.id, verification.userId));
    }

    res.json({ success: true });
  } catch (error) {
    console.error("SheerID webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get verification status for current user
router.get("/status", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const verifications = await db
      .select()
      .from(sheeridVerifications)
      .where(eq(sheeridVerifications.userId, req.user!.id))
      .orderBy(desc(sheeridVerifications.createdAt))
      .limit(1);

    if (verifications.length === 0) {
      return res.json({ status: "not_started" });
    }

    const [verification] = verifications;

    res.json({
      verificationId: verification.verificationId,
      status: verification.status,
      verifiedAt: verification.verifiedAt,
    });
  } catch (error) {
    console.error("Get verification status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

import { desc } from "drizzle-orm";

export default router;
