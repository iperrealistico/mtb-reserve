"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createBikeTypeAction(formData: FormData) {
    const slug = formData.get("slug") as string;
    const name = formData.get("name") as string;
    const totalStock = Number(formData.get("totalStock"));

    if (!slug || !name) return { error: "Missing fields" };

    await db.bikeType.create({
        data: {
            tenantSlug: slug,
            name,
            totalStock,
            brokenCount: 0
        }
    });

    revalidatePath(`/${slug}/admin/inventory`);
}

export async function updateBikeTypeAction(formData: FormData) {
    const id = formData.get("id") as string;
    const slug = formData.get("slug") as string;
    const totalStock = Number(formData.get("totalStock"));
    const brokenCount = Number(formData.get("brokenCount"));

    await db.bikeType.update({
        where: { id },
        data: {
            totalStock,
            brokenCount
        }
    });

    revalidatePath(`/${slug}/admin/inventory`);
    revalidatePath(`/${slug}`); // Update availability on public page
}
