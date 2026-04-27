import { db } from "@/lib/db";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import TemplateManager from "./template-manager";
import { getEmailTemplatesAction } from "./actions";
import {
    markThreadReadAction,
    replyToThreadAction,
    resendOrganizerAccessAction,
    toggleThreadStatusAction,
} from "./inbox-actions";
import { getTenantRouteSlug } from "@/lib/tenants";

export const dynamic = "force-dynamic";

export default async function EmailsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const activeTab = params.tab || "logs";
    const tenantId = typeof params.tenantId === 'string' ? params.tenantId : undefined;
    const selectedThreadId = typeof params.threadId === "string" ? params.threadId : undefined;
    const page = typeof params.page === 'string' ? Number(params.page) : 1;
    const limit = 50;

    // Fetch data based on tab
    let emails: any[] = [];
    let savedTemplates: any[] = [];
    let requests: any[] = [];
    let threads: any[] = [];
    let selectedThread: any = null;

    if (activeTab === "logs") {
        const where: any = {
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
    } else if (activeTab === "inbox") {
        threads = await db.inboxThread.findMany({
            orderBy: { latestMessageAt: "desc" },
            take: 100,
        });

        const resolvedThreadId = selectedThreadId || threads[0]?.id;
        if (resolvedThreadId) {
            selectedThread = await db.inboxThread.findUnique({
                where: { id: resolvedThreadId },
                include: {
                    messages: {
                        orderBy: { createdAt: "asc" },
                        include: {
                            attachments: true,
                        },
                    },
                },
            });
        }
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
        });
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Email Console</h1>
                <p className="text-base text-gray-500 mt-2">Monitor delivery, manage inbox, and customize communication.</p>
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
                    href="/admin/emails?tab=inbox"
                    className={`pb-4 px-6 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === "inbox"
                        ? "text-black border-b-2 border-black"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                >
                    Inbox
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
            )}

            {activeTab === "inbox" && (
                <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-4">
                            <h2 className="text-lg font-bold text-gray-900">Mailbox</h2>
                            <p className="text-sm text-gray-500">Inbound emails to `contact@mtbreserve.com`.</p>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {threads.length === 0 ? (
                                <div className="px-6 py-10 text-sm text-gray-500">No emails received yet.</div>
                            ) : (
                                threads.map((thread) => {
                                    const isSelected = selectedThread?.id === thread.id;

                                    return (
                                        <Link
                                            key={thread.id}
                                            href={`/admin/emails?tab=inbox&threadId=${thread.id}`}
                                            className={`block px-6 py-4 transition-colors ${isSelected ? "bg-gray-50" : "hover:bg-gray-50/70"}`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-gray-900">
                                                        {thread.participantName || thread.participantEmail}
                                                    </p>
                                                    <p className="truncate text-xs text-gray-500">{thread.participantEmail}</p>
                                                </div>
                                                {thread.unreadCount > 0 && (
                                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                                                        {thread.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-3 truncate text-sm font-medium text-gray-700">{thread.subject}</p>
                                            <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                                                <span>{thread.status}</span>
                                                <span>{formatDistanceToNow(new Date(thread.latestMessageAt), { addSuffix: true })}</span>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
                        {!selectedThread ? (
                            <div className="px-8 py-16 text-center text-sm text-gray-500">
                                Select a thread to read and reply.
                            </div>
                        ) : (
                            <>
                                <div className="border-b border-gray-100 px-8 py-6">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">{selectedThread.subject}</h2>
                                            <p className="mt-2 text-sm text-gray-500">
                                                Conversation with {selectedThread.participantName || selectedThread.participantEmail}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <form action={markThreadReadAction}>
                                                <input type="hidden" name="threadId" value={selectedThread.id} />
                                                <button type="submit" className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                                                    Mark Read
                                                </button>
                                            </form>
                                            <form action={toggleThreadStatusAction}>
                                                <input type="hidden" name="threadId" value={selectedThread.id} />
                                                <input
                                                    type="hidden"
                                                    name="status"
                                                    value={selectedThread.status === "OPEN" ? "CLOSED" : "OPEN"}
                                                />
                                                <button type="submit" className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                                                    {selectedThread.status === "OPEN" ? "Close Thread" : "Reopen Thread"}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 bg-gray-50/60 px-6 py-6">
                                    {selectedThread.messages.map((message: any) => (
                                        <div
                                            key={message.id}
                                            className={`rounded-2xl border px-5 py-4 shadow-sm ${message.direction === "OUTBOUND"
                                                ? "ml-auto max-w-3xl border-blue-100 bg-blue-50"
                                                : "max-w-3xl border-gray-200 bg-white"
                                                }`}
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {message.direction === "OUTBOUND" ? "MTB Reserve" : message.fromAddress}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        To: {Array.isArray(message.toAddresses) ? message.toAddresses.join(", ") : ""}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-gray-400">
                                                    {format(
                                                        new Date(message.receivedAt || message.sentAt || message.createdAt),
                                                        "PPP p",
                                                    )}
                                                </p>
                                            </div>

                                            <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                                {message.textBody || "(no text content)"}
                                            </div>

                                            {message.attachments.length > 0 && (
                                                <div className="mt-4 border-t border-gray-100 pt-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Attachments
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {message.attachments.map((attachment: any) => (
                                                            <a
                                                                key={attachment.id}
                                                                href={`/api/admin/inbox/attachments/${attachment.resendAttachmentId}`}
                                                                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                {attachment.filename}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <form action={replyToThreadAction} className="border-t border-gray-100 px-8 py-6">
                                    <input type="hidden" name="threadId" value={selectedThread.id} />
                                    <label htmlFor="body" className="block text-sm font-semibold text-gray-900">
                                        Reply
                                    </label>
                                    <textarea
                                        id="body"
                                        name="body"
                                        rows={8}
                                        required
                                        className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-gray-400"
                                        placeholder="Write a plain-text reply..."
                                    />
                                    <div className="mt-4 flex items-center justify-between gap-3">
                                        <p className="text-xs text-gray-500">
                                            Replies are sent from `contact@mtbreserve.com` and stored in this thread.
                                        </p>
                                        <button
                                            type="submit"
                                            className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
                                        >
                                            Send Reply
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
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
                                requests.map((request: any) => {
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
