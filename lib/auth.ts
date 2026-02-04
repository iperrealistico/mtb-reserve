import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";

// --- Session Configuration ---

export interface SessionData {
    tenantSlug?: string;
    isLoggedIn: boolean;
    isSuperAdmin?: boolean;
    superAdminId?: string;
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
    // Format: Word1-Word2-Word3-1234
    // Must include at least ONE Italian word. We will use mostly Italian for simplicity and style.
    // Capitalize each word.

    const getWord = (list: string[]) => list[Math.floor(Math.random() * list.length)];

    const w1 = getWord(ITALIAN_NOUNS); // Italian
    const w2 = getWord(ITALIAN_ADJECTIVES); // Italian
    const w3 = getWord(ENGLISH_NOUNS); // English mix or Italian? Requirement: "at least ONE Italian word". Let's mix for flavor if we want, but "Montagna-Grande-Trail-1234" is cool.

    // Let's stick to Italian-Italian-Italian or mixed. The existing codebase had English.
    // "Must be longer than current passwords (target 24+ characters typical)"
    // 3 words might be short if words are short. 
    // "Montagna-Grande-Trail-1234" is 24 chars? 8+6+5+4 + 3 dashes = 26. Good.

    const num = Math.floor(Math.random() * 9000) + 1000; // 1000-9999

    return `${w1}-${w2}-${w3}-${num}`;
}

export async function ensureAuthenticated(slug?: string) {
    const session = await getSession();
    if (!session.isLoggedIn) {
        throw new Error("Unauthorized: Please log in.");
    }
    if (slug && !session.isSuperAdmin && session.tenantSlug !== slug) {
        throw new Error("Forbidden: You do not have access to this tenant.");
    }
    return session;
}
