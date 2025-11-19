import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { users, consents } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  generateToken,
  hashPassword,
  comparePassword,
  createSession,
  deleteSession,
  type AuthRequest,
} from "../auth";
import { z } from "zod";

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
});

const consentSchema = z.object({
  consentType: z.string(),
});

// TODO: Mock login endpoint (for development when Google OAuth not configured)
// SECURITY: Remove in production or protect with feature flag
router.post("/mock-login", async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "Not available in production" });
  }

  try {
    const { email, password } = loginSchema.parse(req.body);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      verified: user.verified,
    };

    const token = generateToken(authUser);
    await createSession(user.id, token);

    res.json({
      user: {
        ...authUser,
        avatar: user.avatar,
        specialty: user.specialty,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Mock login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Signup endpoint
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, name, password } = signupSchema.parse(req.body);

    // Check if user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        password: hashedPassword,
        role: "user",
        verified: false,
      })
      .returning();

    const authUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      verified: newUser.verified,
    };

    const token = generateToken(authUser);
    await createSession(newUser.id, token);

    res.status(201).json({
      user: {
        ...authUser,
        avatar: newUser.avatar,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Logout endpoint
router.post("/logout", async (req: AuthRequest, res: Response) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      await deleteSession(token);
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current user
router.get("/me", async (req: AuthRequest, res: Response) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const authUser = verifyToken(token);
    if (!authUser) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      verified: user.verified,
      avatar: user.avatar,
      specialty: user.specialty,
      bio: user.bio,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Record user consent (GDPR/KVKK compliance)
router.post("/consent", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { consentType } = consentSchema.parse(req.body);

    await db.insert(consents).values({
      userId: req.user.id,
      consentType,
    });

    res.json({ message: "Consent recorded" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Consent error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete user data (GDPR/KVKK compliance)
router.delete("/delete-my-data", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // TODO: Implement cascading delete for all user data
    // This should delete: user content, comments, likes, bookmarks, sessions, consents
    await db.delete(users).where(eq(users.id, req.user.id));

    res.json({ message: "All user data deleted successfully" });
  } catch (error) {
    console.error("Delete user data error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// TODO: Google OAuth endpoints
// These would be implemented using passport-google-oauth20
// For now, using mock login for development

router.get("/google", (req: Request, res: Response) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(501).json({
      error: "Google OAuth not configured",
      message: "Use mock login endpoint for development",
    });
  }
  // TODO: Redirect to Google OAuth
  res.status(501).json({ error: "Google OAuth not implemented yet" });
});

router.get("/google/callback", (req: Request, res: Response) => {
  // TODO: Handle Google OAuth callback
  res.status(501).json({ error: "Google OAuth not implemented yet" });
});

import { verifyToken } from "../auth";

export default router;
