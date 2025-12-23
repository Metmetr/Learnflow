import "dotenv/config";
import { db } from "../api/_server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function makeAdmin() {
    const email = "metecanecevit@gmail.com";
    console.log(`Searching for user: ${email}...`);

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
        console.error("User not found! Please ensure you have registered with this email first.");
        process.exit(1);
    }

    await db.update(users).set({ role: "admin" }).where(eq(users.id, user.id));
    console.log(`Successfully promoted ${user.name} (${email}) to ADMIN.`);
    process.exit(0);
}

makeAdmin().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
