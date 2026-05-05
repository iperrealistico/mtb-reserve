import { db } from "@/lib/db";
import { format } from "date-fns";
import Link from "next/link";
import TemplateManager from "./template-manager";
import { getEmailTemplatesAction, resendOrganizerAccessAction } from "./actions";
import { getTenantRouteSlug } from "@/lib/tenants";

export const dynamic = "force-dynamic";

type EmailLogRow = Awaited<ReturnType<typeof db.eventLog.findMany>>;
type EmailTemplateRow = Awaited<ReturnType<typeof getEmailTemplatesAction>>;
type ApplicationRow = {
    id: string;
    tenantSlug: string | null;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    organization: string;
    address: string | null;
    message: string | null;
    provisioningStatus: string;
    failureReason: string | null;
    createdAt: Date;
    tenant: {
        slug: string;
        publicSlug: string | null;
        name: string;
        isPublished: boolean;
    } | null;
};
type EmailLogMetadata = {
    to?: string | string[];
    type?: string;
    providerId?: string;
    error?: string;
};

export default async function EmailsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const requestedTab = typeof params.tab === "string" ? params.tab : "logs";
    const activeTab = requestedTab === "applications" || requestedTab === "templates" ? requestedTab : "logs";
    const tenantId = typeof params.tenantId === 'string' ? params.tenantId : undefined;
    const page = typeof params.page === 'string' ? Number(params.page) : 1;
    const limit = 50;

    // Fetch data based on tab
    let emails: EmailLogRow = [];
    let savedTemplates: EmailTemplateRow = [];
    let requests: ApplicationRow[] = [];

    if (activeTab === "logs") {
        const where: {
            eventType: { in: string[] };
            tenantId?: string;
        } = {
            eventType: { in: ["EMAIL_SENT", "EMAIL_FAILED", "EMAIL_SENT_MOCK"] }
        };
        if (tenantId) where.tenantId = tenantId;

        emails = await db.eventLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: (page - 1) * limit
        });
    } else if (activeTab === "templates") {
        savedTemplates = await getEmailTemplatesAction();
    } else if (activeTab === "applications") {
        requests = await db.signupRequest.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                tenant: {
                    select: {
                        slug: true,
                        publicSlug: true,
                        name: true,
                        isPublished: true,
                    },
                },
            },
        }) as ApplicationRow[];
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Email Console</h1>
                <p className="text-base text-gray-500 mt-2">Monitor delivery, resend organizer access, and customize communication.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
                <Link
                    href="/admin/emails?tab=logs"
                    className={`pb-4 px-6 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === "logs" || !activeTab
                        ? "text-black border-b-2 border-black"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                >
                    Delivery Logs
                </Link>
                <Link
                    href="/admin/emails?tab=applications"
                    className={`pb-4 px-6 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === "applications"
                        ? "text-black border-b-2 border-black"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                >
                    Applications
                </Link>
                <Link
                    href="/admin/emails?tab=templates"
                    className={`pb-4 px-6 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === "templates"
                        ? "text-black border-b-2 border-black"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                >
                    Template Editor
                </Link>
            </div>

            {activeTab === "logs" && (
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
                            {emails.map((log) => {
                                const meta = (log.metadata || {}) as EmailLogMetadata;
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
            )}

            {activeTab === "applications" && (
                <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-black uppercase tracking-widest text-gray-400">
                            <tr>
                                <th className="px-6 py-4">Applicant</th>
                                <th className="px-6 py-4">Organization</th>
                                <th className="px-6 py-4">Provisioning</th>
                                <th className="px-6 py-4">Organizer</th>
                                <th className="px-6 py-4">Received</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No applications received yet.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((request) => {
                                    const routeSlug = request.tenant ? getTenantRouteSlug(request.tenant) : null;
                                    const canResend = request.tenantSlug && request.provisioningStatus !== "DUPLICATE";

                                    return (
                                        <tr key={request.id} className="align-top">
                                            <td className="px-6 py-5">
                                                <div className="font-semibold text-gray-900">
                                                    {request.firstName} {request.lastName}
                                                </div>
                                                <div className="mt-1 text-xs text-gray-500">{request.email}</div>
                                                <div className="mt-1 text-xs text-gray-500">{request.phone}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-semibold text-gray-900">{request.organization}</div>
                                                <div className="mt-1 text-xs text-gray-500">{request.address || "No location provided"}</div>
                                                {request.message && (
                                                    <p className="mt-2 max-w-xs whitespace-pre-wrap text-xs text-gray-500">
                                                        {request.message}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                                                    {request.provisioningStatus}
                                                </div>
                                                {request.failureReason && (
                                                    <p className="mt-2 max-w-xs text-xs text-red-600">{request.failureReason}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                {request.tenant ? (
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{request.tenant.name}</div>
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            Public URL: /{routeSlug}
                                                        </div>
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            {request.tenant.isPublished ? "Published" : "Private"}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Not created</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-xs text-gray-500">
                                                <div>{format(new Date(request.createdAt), "PPP")}</div>
                                                <div className="mt-1">{format(new Date(request.createdAt), "p")}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-end gap-2">
                                                    {canResend && (
                                                        <form action={resendOrganizerAccessAction}>
                                                            <input type="hidden" name="signupRequestId" value={request.id} />
                                                            <button
                                                                type="submit"
                                                                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                            >
                                                                Resend Access
                                                            </button>
                                                        </form>
                                                    )}
                                                    {request.tenant && (
                                                        <Link
                                                            href={`/admin/tenants/${request.tenant.slug}`}
                                                            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                        >
                                                            Open Organizer
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === "templates" && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <TemplateManager initialTemplates={savedTemplates} />
                </div>
            )}
        </div>
    );
}
