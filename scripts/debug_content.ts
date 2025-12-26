
import "dotenv/config";
import { db } from "../api/_server/db";
import { content } from "../shared/schema";
import { desc } from "drizzle-orm";

async function main() {
    const latestContent = await db
        .select()
        .from(content)
        .orderBy(desc(content.createdAt))
        .limit(1);

    if (latestContent.length > 0) {
        console.log("Latest Content Media URL:", JSON.stringify(latestContent[0].mediaUrl));
        console.log("Title:", latestContent[0].title);
    } else {
        console.log("No content found.");
    }
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
