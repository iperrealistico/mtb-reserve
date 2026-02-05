import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SuperAdminNav from "./nav";

export default async function SuperAdminAuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session.isLoggedIn || !session.isSuperAdmin) {
        redirect("/admin/login");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SuperAdminNav />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
