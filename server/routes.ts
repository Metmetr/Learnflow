import type { Express } from "express";
import { createServer, type Server } from "http";
import authRoutes from "./routes/auth";
import contentRoutes from "./routes/content";
import socialRoutes from "./routes/social";
import feedRoutes from "./routes/feed";
import adminRoutes from "./routes/admin";
import sheeridRoutes from "./routes/sheerid";
import n8nRoutes from "./routes/n8n";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register all API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/content", contentRoutes);
  app.use("/api/social", socialRoutes);
  app.use("/api/feed", feedRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/sheerid", sheeridRoutes);
  app.use("/api/n8n", n8nRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
