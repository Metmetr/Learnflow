import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
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

  const httpServer = createServer(app);

  return httpServer;
}
