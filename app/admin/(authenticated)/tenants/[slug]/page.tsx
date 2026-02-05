import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import TenantDetailForm from "./detail-form";
import TenantEmailer from "./emailer";
import TenantPasswordReset from "./password-reset";
import { deleteTenantAction } from "../../actions";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function TenantDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const tenant = await db.tenant.findUnique({
        where: { slug }
    });

    if (!tenant) notFound();

    // Delete action wrapper to satisfy TS and handle prevState
    const deleteAction = async (formData: FormData) => {
        "use server";
        await deleteTenantAction(null, formData);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage: {tenant.name}</h1>
                    <p className="text-sm text-gray-500 mt-1">/{tenant.slug}</p>
                </div>
                <Link href="/admin" className="text-gray-500 hover:text-gray-900 text-sm">
                    Back to Dashboard
                </Link>
            </div>

            {/* Basic Info */}
            <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="text-lg font-medium mb-4">Basic Details</h3>
                <TenantDetailForm
                    slug={slug}
                    initialName={tenant.name}
                    initialEmail={tenant.contactEmail}
                />
            </div>

            {/* Password Reset */}
            <TenantPasswordReset slug={slug} />

            {/* Emailer */}
            <TenantEmailer slug={slug} adminEmail={tenant.contactEmail} />

            {/* Impersonation */}
            <div className="bg-white p-6 shadow rounded-lg">
                <h3 className="text-lg font-medium mb-4">Access Tenant Admin</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Open this tenant&apos;s admin panel in a new tab (you&apos;ll be logged in as Super Admin).
                </p>
                <a
                    href={`/${tenant.slug}/admin/dashboard`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center"
                >
                    <Button variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Admin Panel
                    </Button>
                </a>
            </div>

            {/* Delete */}
            <div className="bg-white p-6 shadow rounded-lg border-red-200 border">
                <h3 className="text-lg font-medium text-red-800 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Permanently delete this tenant and all associated data. This action cannot be undone.
                </p>

                <form action={deleteAction}>
                    <input type="hidden" name="slug" value={slug} />
                    <Button type="submit" variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Tenant
                    </Button>
                </form>
            </div>
        </div>
    );
}
