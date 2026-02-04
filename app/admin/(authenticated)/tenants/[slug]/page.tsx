import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import TenantDetailForm from "./detail-form";
import TenantContentEditor from "./content-editor";
import TenantEmailer from "./emailer";
import TenantPasswordReset from "./password-reset";
import { TenantSettings } from "@/lib/tenants";
import { deleteTenantAction } from "../../actions"; // We'll keep delete inline or use form

export default async function TenantDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const tenant = await db.tenant.findUnique({
        where: { slug }
    });

    if (!tenant) notFound();

    // Type coercion for settings
    const settings = (tenant.settings as unknown) as TenantSettings;

    // Delete action wrapper to satisfy TS and handle prevState
    const deleteAction = async (formData: FormData) => {
        "use server";
        await deleteTenantAction(null, formData);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Manage Tenant: {tenant.name}</h1>
                <Link href="/admin" className="text-indigo-600 hover:text-indigo-900">&larr; Back to Dashboard</Link>
            </div>

            {/* Basic Info */}
            <div className="bg-white p-6 shadow rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Basic Details</h3>
                <TenantDetailForm
                    slug={slug}
                    initialName={tenant.name}
                    initialEmail={tenant.contactEmail}
                />
            </div>

            {/* Content Editor */}
            <TenantContentEditor slug={slug} initialSettings={settings} />

            {/* Password Reset */}
            <TenantPasswordReset slug={slug} />

            {/* Emailer */}
            <TenantEmailer slug={slug} adminEmail={tenant.contactEmail} />

            {/* Impersonation */}
            <div className="bg-gray-50 p-6 shadow rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Impersonate</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Access this tenant&apos;s dashboard as yourself (Super Admin).
                </p>
                <a
                    href={`/${tenant.slug}/admin/dashboard`}
                    target="_blank"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                    Open Admin Panel ↗
                </a>
            </div>

            {/* Delete */}
            <div className="bg-white p-6 shadow rounded-lg border border-red-200 mt-12">
                <h3 className="text-lg font-medium text-red-800">Danger Zone</h3>
                <p className="text-sm text-red-600 mb-4">Actions here cannot be undone.</p>

                <form action={deleteAction}>
                    <input type="hidden" name="slug" value={slug} />
                    <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700">
                        Delete Tenant Permanently
                    </button>
                </form>
            </div>
        </div>
    );
}
