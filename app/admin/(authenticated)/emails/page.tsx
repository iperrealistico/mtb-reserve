import { db } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function EmailsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const tenantId = typeof params.tenantId === 'string' ? params.tenantId : undefined;
    const page = typeof params.page === 'string' ? Number(params.page) : 1;
    const limit = 50;

    const where: any = {
        eventType: { in: ["EMAIL_SENT", "EMAIL_FAILED", "EMAIL_SENT_MOCK"] }
    };

    // Note: Emails are often SYSTEM actor without tenantId unless logged explicitly with tenantId.
    // In our instrumentation, some have tenantId (if implicit?) but mostly SYSTEM actor.
    // So tenant filter might filter out emails if we didn't attach tenantId to logs.
    // We attached `metadata.to`.
    // If tenantId filter is requested, we should check tenantId column.
    if (tenantId) where.tenantId = tenantId;

    const emails = await db.eventLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Email Delivery Log</h1>
            </div>

            <div className="border rounded-md bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b text-gray-500 uppercase text-xs font-semibold">
                        <tr>
                            <th className="p-4">Time</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Recipient</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {emails.map(log => {
                            const meta = log.metadata as any || {};
                            const isFailed = log.eventType === 'EMAIL_FAILED';
                            const isMock = log.eventType === 'EMAIL_SENT_MOCK';

                            return (
                                <tr key={log.id} className="hover:bg-gray-50/50">
                                    <td className="p-4 text-gray-500 whitespace-nowrap">{format(log.createdAt, "MMM d, HH:mm:ss")}</td>
                                    <td className="p-4">
                                        {isFailed ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                Failed
                                            </span>
                                        ) : isMock ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                Mock
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                Sent
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">{meta.to || "-"}</td>
                                    <td className="p-4 text-gray-600 capitalize">{meta.type?.replace('_', ' ') || "-"}</td>
                                    <td className="p-4">
                                        <div className="text-xs text-gray-400 font-mono">
                                            {isFailed ? (
                                                <span className="text-red-600 truncate max-w-[200px] block" title={JSON.stringify(meta.error)}>{meta.error || "Unknown Error"}</span>
                                            ) : (
                                                meta.providerId || "-"
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {emails.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">No email events found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
