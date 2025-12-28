import * as dotenv from "dotenv";
dotenv.config();
import { desc } from "drizzle-orm";

async function checkComments() {
    // Dynamic import to ensure env vars are loaded first
    const { db } = await import("../api/_server/db");
    const { comments } = await import("../shared/schema");

    console.log("Checking recent comments...");
    const recentComments = await db
        .select()
        .from(comments)
        .orderBy(desc(comments.createdAt))
        .limit(5);

    console.log("Recent Comments:");
    recentComments.forEach(c => {
        // Check if parentId is present (it might be null, which is fine, but we want to see if it's there)
        const pId = c.parentId === null ? "null" : `"${c.parentId}"`;
        console.log(`ID: ${c.id}, ContentId: ${c.contentId}, Content: "${c.body.substring(0, 20)}...", ParentID: ${pId}`);
    });

    process.exit(0);
}

checkComments().catch(console.error);
