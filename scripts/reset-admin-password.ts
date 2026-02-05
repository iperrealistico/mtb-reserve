import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const db = new PrismaClient();

async function main() {
    const password = crypto.randomBytes(12).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const email = process.env.SUPER_ADMIN_EMAIL || "admin@mtb-reserve.com";

    console.log(`Resetting Super Admin password for ${email}...`);

    // Upsert the super admin
    await db.superAdmin.upsert({
        where: { email },
        update: { passwordHash },
        create: {
            email,
            passwordHash,
        },
    });

    console.log("============================================");
    console.log("SUPER ADMIN PASSWORD RESET SUCCESSFUL");
    console.log("Email: " + email);
    console.log("New Password: " + password);
    console.log("============================================");
    console.log("Please save this password securely. It will not be shown again.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
