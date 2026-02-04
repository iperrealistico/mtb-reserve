import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export { };

async function main() {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.error('Usage: tsx scripts/create-super-admin.ts <email> <password>');
        process.exit(1);
    }

    const hash = await bcrypt.hash(password, 12);

    const admin = await prisma.superAdmin.upsert({
        where: { email },
        update: { passwordHash: hash },
        create: {
            email,
            passwordHash: hash,
        },
    });

    console.log(`Super Admin ${admin.email} created/updated.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
