import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { type Request, type Response, type NextFunction } from "express";
import { db } from "./db";
import { users, sessions } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

// SECURITY: JWT secret MUST be set in production via JWT_SECRET environment variable
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  console.warn("⚠️  WARNING: Using default JWT secret in development. Set JWT_SECRET env var for production!");
  return "learnflow-dev-secret-DO-NOT-USE-IN-PRODUCTION";
})();
const TOKEN_EXPIRY = "7d";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "educator" | "admin";
  verified: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// Generate JWT token
export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

// Verify JWT token
export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Compare password
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Authentication middleware
export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }

  req.user = user;
  next();
}

// Optional authentication (doesn't fail if no token)
export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  }

  next();
}

// Role-based authorization middleware
export function requireRole(...roles: Array<"user" | "educator" | "admin">) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}

// Create session in database
export async function createSession(userId: string, token: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  });
}

// Delete session
export async function deleteSession(token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}

// Clean expired sessions
export async function cleanExpiredSessions() {
  await db.delete(sessions).where(sql`expires_at < NOW()`);
}
