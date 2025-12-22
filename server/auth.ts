import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

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
    const pgStore = connectPg(session);

    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is required for session storage");
    }

    const sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ttl: sessionTtl / 1000, // connect-pg-simple expects seconds
        tableName: "sessions",
    });

    app.set("trust proxy", 1);
    app.use(
        session({
            secret: process.env.SESSION_SECRET || "super-secret-session-key",
            resave: false,
            saveUninitialized: false,
            store: sessionStore,
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

    passport.use(
        new LocalStrategy(
            { usernameField: "email" },
            async (email, password, done) => {
                try {
                    const user = await storage.getUserByEmail(email);
                    if (!user || !user.password) {
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
            }
        )
    );

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    // Auth Routes
    app.post("/api/register", async (req, res, next) => {
        try {
            if (!req.body.email || !req.body.password) {
                return res.status(400).send("Email and password are required");
            }

            const existingUser = await storage.getUserByEmail(req.body.email);
            if (existingUser) {
                return res.status(400).send("Email already in use");
            }

            const hashedPassword = await hashPassword(req.body.password);
            const user = await storage.createUser({
                name: req.body.name,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                password: hashedPassword,
                email: req.body.email,
                role: "user",
                verified: false,
            });

            req.login(user, (err) => {
                if (err) return next(err);
                res.json(user);
            });
        } catch (err) {
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
