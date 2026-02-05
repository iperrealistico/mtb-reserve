import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SuperAdminDashboard() {
    const tenants = await db.tenant.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { bookings: true }
            }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage all tenant accounts and their settings</p>
                </div>
                <Link href="/admin/tenants/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Tenant
                    </Button>
                </Link>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                {tenants.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No tenants yet. Create your first tenant to get started.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {tenants.map(tenant => (
                            <li key={tenant.slug}>
                                <Link
                                    href={`/admin/tenants/${tenant.slug}`}
                                    className="block hover:bg-gray-50 transition"
                                >
                                    <div className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <div className="text-lg font-medium text-gray-900 flex items-center gap-2">
                                                    {tenant.name}
                                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
                                                        /{tenant.slug}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {tenant.contactEmail}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8">
                                                <div className="text-center">
                                                    <span className="block text-xl font-bold text-gray-900">
                                                        {tenant._count.bookings}
                                                    </span>
                                                    <span className="text-xs text-gray-500">Bookings</span>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
