import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTenantBySlug, getTenantRouteSlug } from "@/lib/tenants";

export default async function AdminRedirectPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const session = await getSession();
    const tenant = await getTenantBySlug(slug);
    const routeSlug = tenant ? getTenantRouteSlug(tenant) : slug;

    if (session.isLoggedIn && (session.isSuperAdmin || (tenant && session.tenantSlug === tenant.slug))) {
        redirect(`/${routeSlug}/admin/dashboard`);
    } else {
        redirect(`/${routeSlug}/admin/login`);
    }
}
