import { pool } from "./db";

// ... (imports)

export function setupAuth(app: Express) {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 7 days
    const pgStore = connectPg(session);

    const sessionStore = new pgStore({
        pool, // Reuse existing pool
        createTableIfMissing: true,
        ttl: sessionTtl / 1000,
        tableName: "sessions",
    });

    // ... (rest of setup)

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
                if (err) {
                    console.error("Login Error after Register:", err);
                    return next(err);
                }
                res.json(user);
            });
        } catch (err) {
            console.error("Registration Error:", err);
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
