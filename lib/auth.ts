import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

import { db } from "@/lib/db";

// --- Session Configuration ---

export interface SessionData {
    tenantSlug?: string;
    isLoggedIn: boolean;
    isSuperAdmin?: boolean;
    superAdminId?: string;
    tokenVersion?: number;
}

export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long",
    cookieName: "mtbr_session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
    },
};

export async function getSession() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    return session;
}

// --- Password Management ---

const SALT_ROUNDS = 12;

export async function hashPassword(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
}

// --- Memorable Password Generator ---

const ITALIAN_NOUNS = ["Montagna", "Sentiero", "Foresta", "Roccia", "Lago", "Fiume", "Valle", "Cima", "Neve", "Sole", "Luna", "Stella", "Vento", "Amico", "Tempo", "Vita", "Cuore", "Mare", "Terra", "Fuoco"];
const ITALIAN_ADJECTIVES = ["Grande", "Piccolo", "Forte", "Veloc", "Lento", "Alto", "Basso", "Nuovo", "Vecchio", "Bello", "Brutto", "Buono", "Cattivo", "Dolce", "Amaro", "Freddo", "Caldo", "Scuro", "Chiaro"];
const ENGLISH_NOUNS = ["Trail", "Bike", "Ride", "Jump", "Drop", "Turn", "Flow", "Rock", "Root", "Dirt"];

export function generateSecureItalianPassword(): string {
    const getWord = (list: string[]) => list[Math.floor(Math.random() * list.length)];

    const w1 = getWord(ITALIAN_NOUNS);
    const w2 = getWord(ITALIAN_ADJECTIVES);
    const w3 = getWord(ENGLISH_NOUNS);

    const num = Math.floor(Math.random() * 9000) + 1000;

    return `${w1}-${w2}-${w3}-${num}`;
}

export async function ensureAuthenticated(slug?: string) {
    const session = await getSession();
    if (!session.isLoggedIn) {
        throw new Error("Unauthorized: Please log in.");
    }

    // Session Invalidation Check
    if (session.isSuperAdmin && session.superAdminId) {
        const admin = await db.superAdmin.findUnique({
            where: { id: session.superAdminId },
            select: { tokenVersion: true }
        });

        // If admin is deleted or version mismatch
        if (!admin || (admin.tokenVersion !== (session.tokenVersion || 0))) {
            session.destroy();
            throw new Error("Session invalid. Please log in again.");
        }
    } else if (session.tenantSlug) {
        // Correct tenant check
        if (slug && session.tenantSlug !== slug) {
            throw new Error("Forbidden: You do not have access to this tenant.");
        }

        const tenant = await db.tenant.findUnique({
            where: { slug: session.tenantSlug },
            select: { tokenVersion: true }
        });

        if (!tenant || (tenant.tokenVersion !== (session.tokenVersion || 0))) {
            session.destroy();
            throw new Error("Session invalid. Please log in again.");
        }
    }

    if (slug && !session.isSuperAdmin && session.tenantSlug !== slug) {
        throw new Error("Forbidden: You do not have access to this tenant.");
    }

    return session;
}
