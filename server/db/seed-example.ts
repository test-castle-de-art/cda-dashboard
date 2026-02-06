/* EXAMPLE TO GENERATE FIRST USERS, ADJUST ACCORDING TO PREFERENCE */

import "dotenv/config";
import argon2 from "argon2";
import { db } from "./index";
import { users } from "./schema";

const adminUsers = [
    {
        username: "admin1",
        password: "Admin@1234Pass"
    },
    {
        username: "admin2",
        password: "Admin@5678Pass"
    },
    {
        username: "admin3",
        password: "Admin@9012Pass"
    }
];

async function seed() {
    try {
        console.log("🌱 Seeding database with admin users...");

        for (const adminUser of adminUsers) {
            const passwordHash = await argon2.hash(adminUser.password);
            await db.insert(users).values({
                username: adminUser.username,
                passwordHash,
                isAdmin: true
            });
            console.log(`✅ Created user: ${adminUser.username}`);
        }

        console.log("✅ Database seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seed();
