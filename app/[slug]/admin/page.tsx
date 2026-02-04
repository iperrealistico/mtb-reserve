import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminRedirectPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const session = await getSession();

    if (session.isLoggedIn && session.tenantSlug === slug) {
        redirect(`/${slug}/admin/dashboard`);
    } else {
        redirect(`/${slug}/admin/login`);
    }
}
