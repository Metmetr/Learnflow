import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { pool } from "./db";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
    const [hashed, salt] = stored.split(".");
    const hashedPasswordBuf = Buffer.from(hashed, "hex");
    const suppliedPasswordBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}

export interface AuthRequest extends Request {
    user?: any;
}

export function setupAuth(app: Express) {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 7 days
    // Switch to MemoryStore (Safe Mode) to isolate Database/Pooler issues
    // const sessionStore = new pgStore({
    //     pool,
    //     createTableIfMissing: false, 
    //     ttl: sessionTtl / 1000,
    //     tableName: "sessions",
    // });

    app.set("trust proxy", 1);
    app.use(
        session({
            secret: process.env.SESSION_SECRET || "super-secret-session-key",
            resave: false,
            saveUninitialized: false,
            store: new session.MemoryStore(), // Using MemoryStore to bypass Supabase Pooler incompatibility
            cookie: {
                maxAge: sessionTtl,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
            },
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    // ... (Passport config unchanged) ...

    // Auth Routes
    app.post("/api/register", async (req, res, next) => {
        console.log("[Auth] Register request received:", req.body.email);
        try {
            if (!req.body.email || !req.body.password) {
                console.log("[Auth] Missing credentials");
                return res.status(400).send("Email and password are required");
            }

            console.log("[Auth] Checking existing user...");
            const existingUser = await storage.getUserByEmail(req.body.email);
            if (existingUser) {
                console.log("[Auth] User exists:", req.body.email);
                return res.status(400).send("Email already in use");
            }

            console.log("[Auth] Hashing password...");
            const hashedPassword = await hashPassword(req.body.password);

            console.log("[Auth] Creating user in DB...");
            const user = await storage.createUser({
                name: req.body.name,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                password: hashedPassword,
                email: req.body.email,
                role: "user",
                verified: false,
            });
            console.log("[Auth] User created, ID:", user.id);

            console.log("[Auth] Logging in user...");
            req.login(user, (err) => {
                if (err) {
                    console.error("[Auth] Login Error after Register:", err);
                    return next(err);
                }
                console.log("[Auth] Login successful");
                res.json(user);
            });
        } catch (err) {
            console.error("[Auth] Registration Fatal Error:", err);
            next(err);
        }
    });

    app.post("/api/login", (req, res, next) => {
        passport.authenticate("local", (err: any, user: any, info: any) => {
            if (err) return next(err);
            if (!user) return res.status(401).send(info?.message || "Login failed");
            req.login(user, (err) => {
                if (err) return next(err);
                res.json(user);
            });
        })(req, res, next);
    });

    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    app.get("/api/user", (req, res) => {
        if (req.isAuthenticated()) {
            res.json(req.user);
        } else {
            res.status(401).send("Not authenticated");
        }
    });
}

// Middleware
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
}

// Optional Auth Middleware - proceeds even if not authenticated, but populates user if they are
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
    next();
}

export function requireRole(...roles: Array<"user" | "educator" | "admin">) {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.isAuthenticated() || !req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }

        next();
    };
}
