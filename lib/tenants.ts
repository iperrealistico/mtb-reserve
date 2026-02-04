import { db } from "@/lib/db";
import { cache } from "react";

// Cached to prevent duplicate requests in the same render cycle
export const getTenantBySlug = cache(async (slug: string) => {
    return await db.tenant.findUnique({
        where: { slug },
        include: { bikeTypes: true },
    });
});
