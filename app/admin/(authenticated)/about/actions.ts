"use server";

import { revalidatePath } from "next/cache";
import { saveAboutContent, triggerRebuild, AboutPageContent } from "@/lib/about-content";

export async function saveAboutPageAction(content: AboutPageContent): Promise<{ success: boolean; error?: string; rebuildTriggered?: boolean }> {
    try {
        // Save content to database
        await saveAboutContent(content);

        // Trigger rebuild
        const rebuildResult = await triggerRebuild();

        // Revalidate local cache
        revalidatePath("/about");

        return {
            success: true,
            rebuildTriggered: rebuildResult.success,
        };
    } catch (e) {
        console.error("Failed to save about page content:", e);
        return {
            success: false,
            error: e instanceof Error ? e.message : "Failed to save content",
        };
    }
}
