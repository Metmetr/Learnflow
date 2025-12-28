
import * as dotenv from "dotenv";
dotenv.config();
import { eq } from "drizzle-orm";

async function testTreeLogic() {
    const { db } = await import("../api/_server/db");
    const { comments, users } = await import("../shared/schema");

    const contentId = "167b95bc-0af6-4a63-89ff-56f538b9eb14"; // The ID we found earlier

    console.log(`Fetching comments for contentId: ${contentId}`);

    // Simulate API Logic
    const allComments = await db
        .select()
        .from(comments)
        .leftJoin(users, eq(comments.authorId, users.id))
        .where(eq(comments.contentId, contentId))
        .orderBy(comments.createdAt);

    const formattedComments = allComments.map(c => ({
        id: c.comments.id,
        author: {
            id: c.users?.id || "unknown",
            name: c.users?.name || "Unknown User",
            avatar: c.users?.avatar,
        },
        content: c.comments.body,
        createdAt: c.comments.createdAt,
        parentId: c.comments.parentId,
        replies: [],
    }));

    // Simulate Network Serialization (Date objects -> Strings)
    const rawComments = JSON.parse(JSON.stringify(formattedComments));

    console.log(`Fetched ${rawComments.length} comments.`);

    // Simulate Frontend Logic (CommentSection.tsx)
    const commentMap = new Map();
    const roots: any[] = [];

    // 1. Initialize
    rawComments.forEach((c: any) => {
        // Note: In frontend we did { ...c, replies: [] } but here replies is already [] from API
        // ensuring we have fresh objects
        commentMap.set(c.id, { ...c, replies: [] });
    });

    // 2. Link
    rawComments.forEach((c: any) => {
        const comment = commentMap.get(c.id)!;
        if (c.parentId && commentMap.has(c.parentId)) {
            const parent = commentMap.get(c.parentId)!;
            parent.replies!.push(comment);
        } else {
            roots.push(comment);
        }
    });

    // 3. Sort roots
    roots.reverse();

    console.log(`\nReconstructed Tree: ${roots.length} roots.`);

    function printTree(nodes: any[], depth = 0) {
        nodes.forEach(node => {
            const indent = "  ".repeat(depth);
            console.log(`${indent}- [${node.id}] ${node.content} (Parent: ${node.parentId})`);
            if (node.replies && node.replies.length > 0) {
                printTree(node.replies, depth + 1);
            }
        });
    }

    printTree(roots);

    // Verify if replies are missing
    const parentIdCheck = "547d6d61-de20-4256-9315-e9a1c9335eb5";
    const parentInMap = commentMap.get(parentIdCheck);

    if (parentInMap) {
        console.log(`\nSpecific Parent [${parentIdCheck}] has ${parentInMap.replies.length} replies.`);
    } else {
        console.log(`\nSpecific Parent [${parentIdCheck}] NOT FOUND in map.`);
        // Check if it exists in rawComments
        const foundInRaw = rawComments.find((c: any) => c.id === parentIdCheck);
        console.log(`Exists in rawComments? ${!!foundInRaw}`);
    }

    process.exit(0);
}

testTreeLogic().catch(console.error);
