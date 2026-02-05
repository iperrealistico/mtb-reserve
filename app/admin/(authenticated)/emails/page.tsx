import { db } from "@/lib/db";
import { format } from "date-fns";
import TemplateManager from "./template-manager";
import { getEmailTemplatesAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function EmailsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const activeTab = params.tab || "logs";
    const tenantId = typeof params.tenantId === 'string' ? params.tenantId : undefined;
    const page = typeof params.page === 'string' ? Number(params.page) : 1;
    const limit = 50;

    const where: any = {
        eventType: { in: ["EMAIL_SENT", "EMAIL_FAILED", "EMAIL_SENT_MOCK"] }
    };

    if (tenantId) where.tenantId = tenantId;

    const [emails, savedTemplates] = await Promise.all([
        db.eventLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: (page - 1) * limit
        }),
        getEmailTemplatesAction()
    ]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Email Console</h1>
                <p className="text-base text-gray-500 mt-2">Monitor delivery and customize automated communication.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
                <a
                    href="/admin/emails?tab=logs"
                    className={`pb-4 px-6 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === "logs"
                        ? "text-black border-b-2 border-black"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                >
                    Delivery Logs
                </a>
                <a
                    href="/admin/emails?tab=templates"
                    className={`pb-4 px-6 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === "templates"
                        ? "text-black border-b-2 border-black"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                >
                    Template Editor
                </a>
            </div>

            {activeTab === "logs" ? (
                <div className="border border-gray-100 rounded-[2rem] bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="p-6">Timestamp</th>
                                <th className="p-6">Status</th>
                                <th className="p-6">Recipient</th>
                                <th className="p-6">Type</th>
                                <th className="p-6">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {emails.map((log: any) => {
                                const meta = log.metadata as any || {};
                                const isFailed = log.eventType === 'EMAIL_FAILED';
                                const isMock = log.eventType === 'EMAIL_SENT_MOCK';

                                return (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-6 text-gray-400 whitespace-nowrap font-medium">{format(log.createdAt, "MMM d, HH:mm:ss")}</td>
                                        <td className="p-6">
                                            {isFailed ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 ring-1 ring-red-100">
                                                    Failed
                                                </span>
                                            ) : isMock ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-50 text-gray-500 ring-1 ring-gray-100">
                                                    Mock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-600 ring-1 ring-green-100">
                                                    Delivered
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-6 font-bold text-gray-900">{meta.to || "-"}</td>
                                        <td className="p-6">
                                            <span className="text-gray-600 font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs uppercase tracking-tight">
                                                {meta.type?.replace('_', ' ') || "Generic"}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-xs text-gray-400 font-mono">
                                                {isFailed ? (
                                                    <span className="text-red-600 truncate max-w-[200px] block" title={JSON.stringify(meta.error)}>{meta.error || "Unknown Error"}</span>
                                                ) : (
                                                    meta.providerId?.slice(0, 12) + "..." || "-"
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {emails.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-500 italic">No delivery events found in current history.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <TemplateManager initialTemplates={savedTemplates} />
                </div>
            )}
        </div>
    );
}
