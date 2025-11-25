import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { content, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const JARVIS_EMAIL = "jarvis@learnflow.com";

const jarvisContentSchema = z.object({
  title: z.string(),
  summary: z.string().optional(),
  body: z.string(),
  topic: z.string(),
  mediaUrl: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional(),
  type: z.enum(["article", "video", "podcast"]).default("article"),
});

async function getOrCreateJarvis() {
  let [jarvis] = await db
    .select()
    .from(users)
    .where(eq(users.email, JARVIS_EMAIL))
    .limit(1);

  if (!jarvis) {
    [jarvis] = await db
      .insert(users)
      .values({
        email: JARVIS_EMAIL,
        name: "Jarvis",
        role: "admin",
        verified: true,
        bio: "LearnFlow'un yapay zeka asistanı. Her gün yeni eğitim içerikleri paylaşıyorum.",
        specialty: "Yapay Zeka & Eğitim",
        avatar: null,
      })
      .returning();
  }

  return jarvis;
}

router.post("/post", async (req: Request, res: Response) => {
  try {
    const validatedData = jarvisContentSchema.parse(req.body);
    const { title, summary, body, topic, mediaUrl, tags, type } = validatedData;

    const jarvis = await getOrCreateJarvis();

    const [newContent] = await db
      .insert(content)
      .values({
        title,
        body,
        excerpt: summary || body.substring(0, 200) + "...",
        topics: tags && tags.length > 0 ? tags : [topic],
        mediaUrl: mediaUrl || null,
        source: "jarvis",
        authorId: jarvis.id,
        verificationStatus: "verified",
        type: type,
        popularity: 0,
      })
      .returning();

    res.status(201).json({
      success: true,
      contentId: newContent.id,
      title: newContent.title,
      message: "Content published successfully by Jarvis",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Jarvis post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/update", async (req: Request, res: Response) => {
  try {
    const { id, title, body, summary, mediaUrl, topics } = req.body;

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

    if (existingContent.source !== "jarvis" && existingContent.source !== "n8n") {
      return res.status(403).json({ error: "Can only update Jarvis-created content" });
    }

    const [updated] = await db
      .update(content)
      .set({
        title: title || existingContent.title,
        body: body || existingContent.body,
        excerpt: summary || existingContent.excerpt,
        mediaUrl: mediaUrl !== undefined ? mediaUrl : existingContent.mediaUrl,
        topics: topics || existingContent.topics,
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
    console.error("Jarvis update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/delete/:id", async (req: Request, res: Response) => {
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

    if (existingContent.source !== "jarvis" && existingContent.source !== "n8n") {
      return res.status(403).json({ error: "Can only delete Jarvis-created content" });
    }

    await db.delete(content).where(eq(content.id, id));

    res.json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Jarvis delete error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
