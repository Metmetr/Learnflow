import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";


const app = express();
app.use(cookieParser());

// Extend express Request type
declare module 'http' {
    interface IncomingMessage {
        rawBody: unknown
    }
}

app.use(express.json({
    verify: (req, _res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }

            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }

            console.log(logLine);
        }
    });

    next();
});

// Async setup wrapper
export async function createApp() {
    const server = await registerRoutes(app);

    app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        res.status(status).json({ message });
        throw err;
    });

    // Importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
        const { setupVite, log } = await import("./vite");
        await setupVite(app, server);
    } else if (process.env.VERCEL !== '1') {
        const { serveStatic } = await import("./vite");
        serveStatic(app);
    }

    return { app, server };
}
