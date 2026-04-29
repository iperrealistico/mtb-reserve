import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
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
    const tenant = await getTenantBySlug(slug);

    if (!tenant) notFound();

    // 1. Verify Session
    const session = await getSession();
    if (!session.isLoggedIn) {
        redirect(`/${slug}/admin/login`);
    }

    if (!session.isSuperAdmin && session.tenantSlug !== tenant.slug) {
        redirect(`/${slug}/admin/login`);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav slug={slug} accountLabel={tenant.name} />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
