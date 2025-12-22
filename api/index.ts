import { createApp } from "../server/app";

// Cache the app instance
let appPromise: Promise<{ app: any; server: any }> | null = null;

export default async function handler(req: any, res: any) {
    try {
        if (!appPromise) {
            appPromise = createApp();
        }
        const { app } = await appPromise;
        // Vercel serverless function handler
        return app(req, res);
    } catch (error) {
        console.error("Vercel Function Error:", error);
        res.status(500).send("Internal Server Error");
    }
}
