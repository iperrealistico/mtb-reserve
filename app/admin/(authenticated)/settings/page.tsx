import { getSiteSettings } from "@/lib/site-settings";
import SiteSettingsForm from "./settings-form";

export default async function SiteSettingsPage() {
    const settings = await getSiteSettings();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Configure global SEO settings, favicon, and social media preview images
                </p>
            </div>

            <SiteSettingsForm initialSettings={settings} />
        </div>
    );
}
