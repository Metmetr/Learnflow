import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { content, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const N8N_API_KEY = process.env.N8N_API_KEY || "n8n-development-key";

// Middleware to verify n8n API key
function verifyN8NKey(req: Request, res: Response, next: Function) {
  const apiKey = req.headers["x-n8n-key"];

  if (!apiKey || apiKey !== N8N_API_KEY) {
    return res.status(401).json({ error: "Invalid or missing API key" });
  }

  next();
}

// Apply API key verification to all n8n routes
router.use(verifyN8NKey);

// Schema for n8n content creation
const n8nContentSchema = z.object({
  title: z.string().min(5),
  summary: z.string().optional(),
  body: z.string().min(20),
  topic: z.string(),
  mediaUrl: z.string().url().optional(),
  source: z.string().default("n8n"),
  tags: z.array(z.string()).optional(),
});

// Create content via n8n webhook
// TODO: Add rate limiting to prevent abuse
router.post("/content/create", async (req: Request, res: Response) => {
  try {
    const { title, summary, body, topic, mediaUrl, source, tags } =
      n8nContentSchema.parse(req.body);

    // Get system user
    const [systemUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, "system@learnflow.com"))
      .limit(1);

    if (!systemUser) {
      return res.status(500).json({ error: "System user not found" });
    }

    // Create content with pending status
    const [newContent] = await db
      .insert(content)
      .values({
        title,
        body,
        excerpt: summary || body.substring(0, 200) + "...",
        topics: tags || [topic],
        mediaUrl,
        source: source || "n8n",
        authorId: systemUser.id,
        verificationStatus: "pending",
        type: "article",
      })
      .returning();

    res.status(201).json({
      success: true,
      contentId: newContent.id,
      status: newContent.verificationStatus,
      message: "Content created and queued for moderation",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("n8n create content error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update content via n8n
router.post("/content/update", async (req: Request, res: Response) => {
  try {
    const { id, title, body, summary, mediaUrl } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Content ID required" });
    }

    const [existingContent] = await db
      .select()
      .from(content)
      .where(eq(content.id, id))
      .limit(1);

    if (!existingContent) {
      return res.status(404).json({ error: "Content not found" });
    }

    // Only allow updating n8n-created content
    if (existingContent.source !== "n8n") {
      return res.status(403).json({ error: "Can only update n8n-created content" });
    }

    const [updated] = await db
      .update(content)
      .set({
        title: title || existingContent.title,
        body: body || existingContent.body,
        excerpt: summary || existingContent.excerpt,
        mediaUrl: mediaUrl || existingContent.mediaUrl,
        updatedAt: new Date(),
      })
      .where(eq(content.id, id))
      .returning();

    res.json({
      success: true,
      contentId: updated.id,
      message: "Content updated successfully",
    });
  } catch (error) {
    console.error("n8n update content error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Notify endpoint (for n8n to send notifications)
router.post("/notify", async (req: Request, res: Response) => {
  try {
    const { type, message, metadata } = req.body;

    // TODO: Implement notification system
    // This could trigger emails, push notifications, etc.
    console.log("n8n notification:", { type, message, metadata });

    res.json({
      success: true,
      message: "Notification received",
    });
  } catch (error) {
    console.error("n8n notify error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
