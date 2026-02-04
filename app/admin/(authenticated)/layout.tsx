import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

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
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex-shrink-0">
                <div className="p-6">
                    <h1 className="text-xl font-bold">MTBR Super</h1>
                    <p className="text-xs text-gray-400">Owner Access</p>
                </div>
                <nav className="mt-6">
                    <Link href="/admin" className="block py-3 px-6 hover:bg-gray-800 text-gray-200 border-l-4 border-transparent hover:border-indigo-500">
                        Tenants
                    </Link>
                    <Link href="/admin/system" className="block py-3 px-6 hover:bg-gray-800 text-gray-200 border-l-4 border-transparent hover:border-indigo-500">
                        System & Logs
                    </Link>
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Dashboard
                        </h2>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-4">Super Admin</span>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
