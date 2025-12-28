import { Router, type Response } from "express";
import { db } from "../db";
import { reports } from "../../../shared/schema";
import { isAuthenticated as authenticateToken, type AuthRequest } from "../auth";
import { z } from "zod";

const router = Router();

const createReportSchema = z.object({
    contentId: z.string().uuid(),
    reason: z.string().min(1, "Rapor nedeni gereklidir"),
});

router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const validated = createReportSchema.parse(req.body);
        const userId = req.user!.id;

        // Check if user already reported this content to prevent spam (Optional but good practice)
        // For now, allowing multiple reports or relying on frontend checks.
        // Let's implement a simple insertion.

        const [newReport] = await db
            .insert(reports)
            .values({
                contentId: validated.contentId,
                reporterId: userId,
                reason: validated.reason,
                status: "pending",
            })
            .returning();

        res.status(201).json(newReport);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: "Geçersiz veri", errors: error.errors });
        }
        console.error("Create report error:", error);
        res.status(500).json({ message: "Rapor oluşturulamadı" });
    }
});

export default router;
