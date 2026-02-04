import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Parallel queries
    const [emailFailures, rateLimitBlocks, loginFailures, bookingErrors] = await Promise.all([
        db.eventLog.count({ where: { eventType: "EMAIL_FAILED", createdAt: { gte: oneDayAgo } } }),
        db.eventLog.count({ where: { eventType: "RATE_LIMIT_BLOCKED", createdAt: { gte: oneDayAgo } } }),
        db.eventLog.count({ where: { eventType: "LOGIN_FAILURE", createdAt: { gte: oneDayAgo } } }),
        // Check for generic errors if BOOKING_FAILED not used explicitly eventType
        db.eventLog.count({ where: { level: "ERROR", eventType: { contains: "BOOKING" }, createdAt: { gte: oneDayAgo } } }),
    ]);

    // Top Issues
    const topErrorTenants = await db.eventLog.groupBy({
        by: ['tenantId'],
        where: { level: 'ERROR', createdAt: { gte: oneDayAgo }, tenantId: { not: null } },
        _count: {
            _all: true
        },
        orderBy: {
            _count: {
                tenantId: 'desc'
            }
        },
        take: 5
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">System Health (Last 24h)</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card title="Email Failures" count={emailFailures} danger={emailFailures > 0} />
                <Card title="Rate Limit Blocks" count={rateLimitBlocks} warn={rateLimitBlocks > 10} />
                <Card title="Login Failures" count={loginFailures} danger={loginFailures > 5} />
                <Card title="Booking Errors" count={bookingErrors} danger={bookingErrors > 0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6 bg-white shadow-sm">
                    <h3 className="font-semibold mb-4 text-gray-900">Tenants with Most Errors</h3>
                    {topErrorTenants.length === 0 ? (
                        <p className="text-gray-500 text-sm">No errors recorded.</p>
                    ) : (
                        <ul className="space-y-3">
                            {topErrorTenants.map((item, i) => (
                                <li key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                                    <span className="font-medium text-gray-700">{item.tenantId}</span>
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">{item._count._all} errors</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="border rounded-lg p-6 bg-white shadow-sm">
                    <h3 className="font-semibold mb-4 text-gray-900">Recommended Actions</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                        {emailFailures > 0 && <li>Check Resend API logs or quotas.</li>}
                        {rateLimitBlocks > 50 && <li>Investigate potential bot attack (check common IPs in Logs).</li>}
                        {loginFailures > 10 && <li>Possible brute force attempt. Check IP distribution.</li>}
                        {bookingErrors > 0 && <li>Investigate booking logic or database connectivity.</li>}
                        {emailFailures === 0 && rateLimitBlocks < 10 && loginFailures < 5 && bookingErrors === 0 && <li>All systems look healthy.</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function Card({ title, count, danger, warn }: { title: string, count: number, danger?: boolean, warn?: boolean }) {
    let color = "bg-white border-gray-200";
    let textColor = "text-gray-900";

    if (danger) {
        color = "bg-red-50 border-red-200";
        textColor = "text-red-900";
    } else if (warn) {
        color = "bg-amber-50 border-amber-200";
        textColor = "text-amber-900";
    }

    return (
        <div className={`p-6 rounded-lg border ${color} shadow-sm`}>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</div>
            <div className={`text-3xl font-bold mt-2 ${textColor}`}>{count}</div>
        </div>
    )
}
