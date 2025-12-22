import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { pool } from "./db";
import contentRoutes from "./routes/content";
import socialRoutes from "./routes/social";
import feedRoutes from "./routes/feed";
import adminRoutes from "./routes/admin";
import jarvisRoutes from "./routes/jarvis";
import userRoutes from "./routes/user";
import notificationsRoutes from "./routes/notifications";
import searchRoutes from "./routes/search";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.use("/api/content", contentRoutes);
  app.use("/api/social", socialRoutes);
  app.use("/api/feed", feedRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/jarvis", jarvisRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/search", searchRoutes);

  // Health check endpoint to verify DB connection
  app.get("/api/health", async (req, res) => {
    try {
      const result = await pool.query("SELECT NOW()");
      res.json({ status: "ok", time: result.rows[0].now, message: "Database connected successfully" });
    } catch (err: any) {
      console.error("Health Check Failed:", err);
      res.status(500).json({ status: "error", message: err.message, stack: err.stack });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
