import { createChallenge, pbkdf2, sha, verifySolution } from "altcha/lib";

const ALTCHA_HMAC_KEY = process.env.ALTCHA_HMAC_KEY || process.env.SESSION_SECRET;
const ALTCHA_TTL_MS = 5 * 60 * 1000;

function getDeriveKey(algorithm: string) {
    if (algorithm.startsWith("PBKDF2/")) {
        return pbkdf2.deriveKey;
    }

    if (algorithm.startsWith("SHA-")) {
        return sha.deriveKey;
    }

    throw new Error(`Unsupported ALTCHA algorithm: ${algorithm}`);
}

function ensureAltchaSecret() {
    if (!ALTCHA_HMAC_KEY) {
        throw new Error("ALTCHA_HMAC_KEY is not configured");
    }

    return ALTCHA_HMAC_KEY;
}

export async function createJoinRequestAltchaChallenge() {
    const secret = ensureAltchaSecret();

    return createChallenge({
        algorithm: "PBKDF2/SHA-256",
        cost: 5_000,
        deriveKey: pbkdf2.deriveKey,
        expiresAt: new Date(Date.now() + ALTCHA_TTL_MS),
        hmacSignatureSecret: secret,
        data: {
            form: "join-request",
        },
    });
}

export async function verifyAltchaPayload(payload: string) {
    const secret = ensureAltchaSecret();
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));

    if (decoded?.test) {
        return {
            expired: false,
            invalidSignature: false,
            invalidSolution: false,
            time: 0,
            verified: process.env.NODE_ENV !== "production",
        };
    }

    if (!decoded?.challenge || !decoded?.solution) {
        throw new Error("Malformed ALTCHA payload");
    }

    const deriveKey = getDeriveKey(decoded.challenge.parameters.algorithm);
    return verifySolution({
        challenge: decoded.challenge,
        solution: decoded.solution,
        deriveKey,
        hmacSignatureSecret: secret,
    });
}

export function isAltchaConfigured() {
    return Boolean(ALTCHA_HMAC_KEY);
}
