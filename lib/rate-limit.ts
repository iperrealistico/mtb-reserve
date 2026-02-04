
import { db } from "@/lib/db";

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: Date;
}

/**
 * Basic rate limiter using PostgreSQL.
 * @param identifier Unique key (e.g. "login:127.0.0.1")
 * @param limit Max requests
 * @param windowSeconds Window size in seconds
 */
export async function rateLimit(identifier: string, limit: number = 5, windowSeconds: number = 60): Promise<RateLimitResult> {
    const key = `ratelimit:${identifier}`;
    const now = new Date();
    const windowMs = windowSeconds * 1000;

    // Clean up expired (lazy cleanup - specific to this key for now to update it)
    // In a real high-traffic app, a background worker should clean old rows.

    try {
        const record = await db.rateLimit.findUnique({
            where: { key }
        });

        if (!record) {
            // New record
            const expiresAt = new Date(now.getTime() + windowMs);
            await db.rateLimit.create({
                data: {
                    key,
                    count: 1,
                    expiresAt
                }
            });
            return { success: true, limit, remaining: limit - 1, reset: expiresAt };
        }

        if (record.expiresAt < now) {
            // Expired, reset
            const expiresAt = new Date(now.getTime() + windowMs);
            await db.rateLimit.update({
                where: { key },
                data: {
                    count: 1,
                    expiresAt
                } // Reset count and expiry
            });
            return { success: true, limit, remaining: limit - 1, reset: expiresAt };
        }

        // Active window
        if (record.count >= limit) {
            return {
                success: false,
                limit,
                remaining: 0,
                reset: record.expiresAt
            };
        }

        // Increment
        const update = await db.rateLimit.update({
            where: { key },
            data: { count: { increment: 1 } }
        });

        return {
            success: true,
            limit,
            remaining: Math.max(0, limit - update.count),
            reset: record.expiresAt
        };

    } catch (error) {
        console.error("Rate limit error", error);
        // Fail open to avoid blocking legitimate users on db error
        return { success: true, limit, remaining: 1, reset: new Date(now.getTime() + windowMs) };
    }
}
