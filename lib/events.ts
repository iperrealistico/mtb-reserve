import { db } from "@/lib/db";
import { headers } from "next/headers";
import { LogLevel, ActorType } from "@prisma/client";
import crypto from "crypto";

const MAX_METADATA_SIZE = 8192; // 8KB soft limit
const IP_SALT = process.env.IP_SALT || "dev-salt-change-me";

// Sensitive keys to redact
const SENSITIVE_KEYS = [
    "password", "token", "secret", "key",
    "authorization", "cookie", "session",
    "creditcard", "cvv"
];

function sanitize(obj: any): any {
    if (!obj) return obj;
    // Handle circular refs or deep objects? Basic JSON safe limitation
    // Simplest is generic redaction
    try {
        if (typeof obj !== "object") return obj;
        if (Array.isArray(obj)) return obj.map(sanitize);

        const newObj: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const lowerKey = key.toLowerCase();
                const isSensitive = SENSITIVE_KEYS.some(s => lowerKey.includes(s));

                if (isSensitive) {
                    newObj[key] = "[REDACTED]";
                } else if (typeof obj[key] === "object" && obj[key] !== null) {
                    newObj[key] = sanitize(obj[key]);
                } else {
                    newObj[key] = obj[key];
                }
            }
        }
        return newObj;
    } catch (e) {
        return "[sanitize-error]";
    }
}

function hashIp(ip: string | null): string | null {
    if (!ip || ip === "unknown" || ip === "127.0.0.1") return ip;
    return crypto.createHmac("sha256", IP_SALT).update(ip).digest("hex").substring(0, 16);
}

export type EventLogParams = {
    level: LogLevel;
    actorType: ActorType;
    actorId?: string;
    tenantId?: string | null;
    eventType: string;
    message: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, any>;
};

export async function logEvent(params: EventLogParams) {
    // Best effort - do not throw
    try {
        const {
            level, actorType, actorId, tenantId,
            eventType, message, entityType, entityId, metadata
        } = params;

        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") || "unknown";
        const userAgent = headersList.get("user-agent") || "unknown";

        // 1. Sanitize & Size Check
        const safeMetadata = sanitize(metadata || {});
        const jsonString = JSON.stringify(safeMetadata);

        const pMetadata = jsonString.length > MAX_METADATA_SIZE
            ? { ...safeMetadata, _note: "Metadata truncated or large", _originalSize: jsonString.length }
            : safeMetadata;

        const ipHash = hashIp(ip);
        const shortUA = userAgent.substring(0, 256);

        // 2. Database Log
        await db.eventLog.create({
            data: {
                level,
                actorType,
                actorId,
                tenantId,
                eventType,
                message,
                entityType,
                entityId,
                ipHash,
                userAgent: shortUA,
                metadata: pMetadata,
            },
        });

        // 3. Console Log (JSON for Vercel)
        const logPayload = JSON.stringify({
            time: new Date().toISOString(),
            level,
            tenantId,
            eventType,
            msg: message,
            actor: `${actorType}:${actorId}`,
            meta: pMetadata
        });

        if (level === "ERROR") console.error(logPayload);
        else if (level === "WARN") console.warn(logPayload);
        else console.log(logPayload);

    } catch (err) {
        // Fail silent but log to console
        console.error("LOGGING_FAILURE", err);
    }
}
