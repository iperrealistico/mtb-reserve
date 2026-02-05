
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function run() {
    const connectionString = process.env.DATABASE_URL.replace(/\?sslmode=.*$/, "").replace(/&sslmode=.*$/, "");
    if (!connectionString) {
        console.error("DATABASE_URL is missing");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    const password = crypto.randomBytes(12).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const email = process.env.SUPER_ADMIN_EMAIL || "admin@mtb-reserve.com";

    try {
        // Generate a simple CUID-like ID if it's a new record
        const id = 'cl' + Math.random().toString(36).substring(2, 11);

        const result = await pool.query(
            `INSERT INTO "SuperAdmin" (id, email, "passwordHash", "updatedAt", "createdAt") 
       VALUES ($1, $2, $3, NOW(), NOW()) 
       ON CONFLICT (email) DO UPDATE SET "passwordHash" = $3, "updatedAt" = NOW()
       RETURNING *`,
            [id, email, passwordHash]
        );
        console.log("============================================");
        console.log("SUPER ADMIN PASSWORD RESET SUCCESSFUL");
        console.log("Email: " + email);
        console.log("New Password: " + password);
        console.log("============================================");
    } catch (err) {
        console.error("Error during query:", err);
    } finally {
        await pool.end();
    }
}
run();
