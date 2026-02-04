import { getTenantBySlug, getTenantSettings } from "@/lib/tenants";
import { notFound } from "next/navigation";
import SettingsForm from "./settings-form";

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const tenant = await getTenantBySlug(slug);

    if (!tenant) notFound();

    const settings = getTenantSettings(tenant);

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Tenant Settings</h1>
            <SettingsForm
                slug={slug}
                initialEmail={tenant.contactEmail}
                initialPhone={tenant.contactPhone || ""}
                initialSettings={settings}
            />
        </div>
    );
}
