import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

// --- Session Configuration ---

export interface SessionData {
    tenantSlug?: string;
    isLoggedIn: boolean;
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

const ADJECTIVES = ["swift", "blue", "calm", "wild", "fast", "green", "brave", "dark", "bright", "cool"];
const NOUNS = ["hawk", "river", "bear", "wolf", "peak", "trail", "rock", "tree", "moon", "sun"];

export function generateMemorablePassword(): string {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 99) + 1; // 1-99
    return `${adj}-${noun}-${num}`;
}
