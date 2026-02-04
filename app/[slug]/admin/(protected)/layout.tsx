import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ReactNode } from "react";
import AdminNav from "./nav";
import { getTenantBySlug } from "@/lib/tenants";

export default async function AdminProtectedLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    // 1. Verify Session
    const session = await getSession();
    if (!session.isLoggedIn || session.tenantSlug !== slug) {
        redirect(`/${slug}/admin/login`);
    }

    // 2. Verify Tenant exists (optional but good for safety)
    const tenant = await getTenantBySlug(slug);
    if (!tenant) notFound();

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav slug={slug} />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
