import { getTenantBySlug, getTenantSettings } from "@/lib/tenants";
import { notFound } from "next/navigation";
import SettingsForm from "./settings-form";
import PasswordChangeForm from "./password-change-form";

export default async function SettingsPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ tab?: string }>
}) {
    const { slug } = await params;
    const tenant = await getTenantBySlug(slug);

    if (!tenant) notFound();

    const settings = getTenantSettings(tenant);
    const activeTab = (await searchParams).tab || "general";

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
                <p className="text-base text-gray-500 mt-2">
                    Manage your business profile, booking preferences, and account security.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar">
                <a
                    href={`/${slug}/admin/settings?tab=general`}
                    className={`pb-4 px-6 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === "general"
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                >
                    General
                </a>
                <a
                    href={`/${slug}/admin/settings?tab=security`}
                    className={`pb-4 px-6 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === "security"
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                >
                    Security
                </a>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === "general" ? (
                    <SettingsForm
                        slug={slug}
                        initialEmail={tenant.contactEmail}
                        initialPhone={tenant.contactPhone || ""}
                        initialSettings={settings}
                    />
                ) : (activeTab === "security" && (
                    <PasswordChangeForm slug={slug} />
                ))}
            </div>
        </div>
    );
}
