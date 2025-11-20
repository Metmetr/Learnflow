import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import contentRoutes from "./routes/content";
import socialRoutes from "./routes/social";
import feedRoutes from "./routes/feed";
import adminRoutes from "./routes/admin";
import sheeridRoutes from "./routes/sheerid";
import n8nRoutes from "./routes/n8n";
import userRoutes from "./routes/user";
import notificationsRoutes from "./routes/notifications";
import searchRoutes from "./routes/search";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.use("/api/content", contentRoutes);
  app.use("/api/social", socialRoutes);
  app.use("/api/feed", feedRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/sheerid", sheeridRoutes);
  app.use("/api/n8n", n8nRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/search", searchRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
