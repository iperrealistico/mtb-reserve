import { db } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import { format } from "date-fns";

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
                <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
                <Link href="/admin/tenants/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tenant
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {tenants.map(tenant => (
                        <li key={tenant.slug}>
                            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition block">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <div className="text-lg font-medium text-indigo-600 truncate flex items-center gap-2">
                                            {tenant.name}
                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">/{tenant.slug}</span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {tenant.contactEmail}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-center">
                                            <span className="block text-xl font-bold text-gray-900">{tenant._count.bookings}</span>
                                            <span className="text-xs text-gray-500">Bookings</span>
                                        </div>
                                        <div>
                                            <Link href={`/admin/tenants/${tenant.slug}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                                                Manage &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
