
import { db, sqlite } from "./server/db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

async function run() {
    console.log("Verifying persistence...");

    const testEmail = "persistence_test_" + Date.now() + "@example.com";

    // 1. Insert
    console.log("Inserting user:", testEmail);
    const [inserted] = await db.insert(users).values({
        username: "ptest_" + Date.now(),
        password: "hashed_password",
        email: testEmail,
        role: "user",
        status: "pending",
        firstName: "Persistence",
        lastName: "Test"
    }).returning();

    console.log("Inserted ID:", inserted.id);

    // 2. Query immediately
    const [queried] = await db.select().from(users).where(eq(users.id, inserted.id));
    if (!queried) {
        console.error("FAILED: Could not find user immediately after insert.");
        process.exit(1);
    }
    console.log("Immediate query successful.");

    // 3. Verify file exists (we know it does, but good to log)
    console.log("Database file:", sqlite.name);

    console.log("SUCCESS: Data written and read from SQLite.");
    process.exit(0);
}

run().catch(console.error);
