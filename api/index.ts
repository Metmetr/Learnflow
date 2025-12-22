import { createApp } from "../server/app";

// Cache the app instance
let appPromise: Promise<{ app: any; server: any }> | null = null;

// Global Error Trap for Vercel
export default async function handler(req: any, res: any) {
    try {
        if (!appPromise) {
            console.log("[Vercel] Initializing app...");
            appPromise = createApp();
        }
        const { app } = await appPromise;
        return app(req, res);
    } catch (error: any) {
        console.error("Vercel Startup Error:", error);
        // Clean error display for user
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : "No stack trace";

        res.status(200).send(`
            <html>
                <body style="font-family: monospace; padding: 20px; background: #000; color: #ff5555;">
                    <h1>CRITICAL STARTUP ERROR</h1>
                    <h2>The server failed to start.</h2>
                    <hr>
                    <h3>Error:</h3>
                    <pre>${errorMessage}</pre>
                    <h3>Stack:</h3>
                    <pre>${errorStack}</pre>
                </body>
            </html>
        `);
    }
}
