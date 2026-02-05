import { getTenantBySlug, getTenantSettings } from "@/lib/tenants";
import { notFound } from "next/navigation";
import SettingsForm from "./settings-form";

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const tenant = await getTenantBySlug(slug);

    if (!tenant) notFound();

    const settings = getTenantSettings(tenant);

    return (
        <div className="p-4 sm:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Configure your booking page, slots, blocked dates, and more.
                </p>
            </div>
            <SettingsForm
                slug={slug}
                initialEmail={tenant.contactEmail}
                initialPhone={tenant.contactPhone || ""}
                initialSettings={settings}
            />
        </div>
    );
}
