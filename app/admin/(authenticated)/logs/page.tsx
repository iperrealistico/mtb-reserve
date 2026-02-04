import { db } from "@/lib/db";
import { LogLevel } from "@prisma/client";
import { LogsTable } from "./logs-table";

export const dynamic = "force-dynamic";

export default async function LogsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const level = typeof params.level === 'string' ? params.level as LogLevel : undefined;
    const tenantId = typeof params.tenantId === 'string' ? params.tenantId : undefined;
    const type = typeof params.type === 'string' ? params.type : undefined;
    const search = typeof params.search === 'string' ? params.search : undefined;
    const page = typeof params.page === 'string' ? Number(params.page) : 1;
    const limit = 100;

    const where: any = {};
    if (level) where.level = level;
    if (tenantId && tenantId !== "all") where.tenantId = { contains: tenantId, mode: 'insensitive' };
    if (type && type !== "all") where.eventType = type;
    if (search) {
        where.OR = [
            { message: { contains: search, mode: 'insensitive' } },
            { eventType: { contains: search, mode: 'insensitive' } },
        ];
    }

    const logs = await db.eventLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Operation Logs</h1>
                    <p className="text-muted-foreground text-sm">Audit trail and system events.</p>
                </div>
            </div>

            <form className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border items-center">
                <select name="level" className="border rounded px-2 py-1 text-sm bg-white h-9" defaultValue={level || ""}>
                    <option value="">All Levels</option>
                    <option value="INFO">INFO</option>
                    <option value="WARN">WARN</option>
                    <option value="ERROR">ERROR</option>
                </select>
                <select name="type" className="border rounded px-2 py-1 text-sm bg-white h-9" defaultValue={type || ""}>
                    <option value="">All Events</option>
                    <option value="BOOKING_REQUESTED">Booking Requested</option>
                    <option value="BOOKING_CONFIRMED">Booking Confirmed</option>
                    <option value="EMAIL_SENT">Email Sent</option>
                    <option value="EMAIL_FAILED">Email Failed</option>
                    <option value="LOGIN_SUCCESS">Login Success</option>
                    <option value="LOGIN_FAILURE">Login Failure</option>
                    <option value="RATE_LIMIT_BLOCKED">Rate Limit</option>
                </select>
                <input
                    name="search"
                    placeholder="Search messages..."
                    className="border rounded px-2 py-1 text-sm bg-white flex-1 min-w-[200px] h-9"
                    defaultValue={search || ""}
                />
                <button type="submit" className="px-3 py-1 bg-black text-white rounded text-sm font-medium h-9">Filter</button>
                <a href="/admin/logs" className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm font-medium h-9 flex items-center">Reset</a>
            </form>

            <LogsTable logs={logs} />

            <div className="text-center text-xs text-gray-400">
                Showing last {logs.length} records.
            </div>
        </div>
    );
}
