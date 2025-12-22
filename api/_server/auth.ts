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
const pgSession = connectPg(session);

// --- PASSWORD UTILS ---
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

// --- TYPES ---
export interface AuthRequest extends Request {
    user?: any;
}

export function setupAuth(app: Express) {
    // Session Store Configuration
    // CRITICAL: We reuse the existing pool to handle serverless connections efficiently.
    // CRITICAL: createTableIfMissing MUST be false for Supabase Transaction Pooler compatibility.
    const sessionStore = new pgSession({
        pool,
        tableName: "sessions",
        createTableIfMissing: false,
        pruneSessionInterval: 60 * 60, // Prune expired sessions every hour (if app is running)
    });

    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 7 days

    // Proxy trust is required for secure cookies in Vercel/proxied environments
    app.set("trust proxy", 1);

    app.use(
        session({
            secret: process.env.SESSION_SECRET || "super-secret-session-key",
            resave: false,
            saveUninitialized: false,
            store: sessionStore,
            cookie: {
                maxAge: sessionTtl,
                httpOnly: true, // Prevent JS access to cookie
                secure: process.env.NODE_ENV === "production", // Secure in prod
                sameSite: "lax", // CSRF protection
            },
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    // Passport Configuration
    passport.use(
        new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
            try {
                const user = await storage.getUserByEmail(email);
                if (!user) {
                    return done(null, false, { message: "Invalid email or password" });
                }

                const isValid = await comparePasswords(password, user.password);
                if (!isValid) {
                    return done(null, false, { message: "Invalid email or password" });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        })
    );

    passport.serializeUser((user: any, done) => done(null, user.id));
    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    // --- AUTH ROUTES ---

    // Register Route
    app.post("/api/register", async (req, res, next) => {
        try {
            const { email, password, name, firstName, lastName } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }

            const existingUser = await storage.getUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: "Email already exists" });
            }

            const hashedPassword = await hashPassword(password);

            const user = await storage.createUser({
                email,
                password: hashedPassword,
                name: name || "",
                firstName: firstName || "",
                lastName: lastName || "",
                role: "user",
                verified: false,
            });

            req.login(user, (err) => {
                if (err) {
                    console.error("[Auth] Login error after register:", err);
                    return res.status(500).json({ message: "Registration successful but login failed. Please login manually." });
                }
                return res.status(201).json(user);
            });
        } catch (err: any) {
            console.error("[Auth] Registration Fatal Error:", err);
            // Return explicit error to client
            res.status(500).json({ message: "Registration failed: " + (err.message || String(err)) });
        }
    });

    // Login Route
    app.post("/api/login", (req, res, next) => {
        passport.authenticate("local", (err: any, user: any, info: any) => {
            if (err) {
                console.error("[Auth] Login Error:", err);
                return res.status(500).json({ message: "Internal login error" });
            }
            if (!user) {
                return res.status(401).json({ message: info?.message || "Login failed" });
            }
            req.login(user, (err) => {
                if (err) {
                    console.error("[Auth] Session Error:", err);
                    return res.status(500).json({ message: "Session creation failed" });
                }
                return res.json(user);
            });
        })(req, res, next);
    });

    // Logout Route
    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return res.status(500).json({ message: "Logout failed" });
            res.sendStatus(200);
        });
    });

    // Current User Route
    app.get("/api/user", (req, res) => {
        if (req.isAuthenticated()) {
            res.json(req.user);
        } else {
            res.status(401).json({ message: "Not authenticated" });
        }
    });
}

// --- MIDDLEWARE ---
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
}

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
