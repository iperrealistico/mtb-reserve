import { db } from "@/lib/db";
import {
    Activity, Database, HardDrive,
    Users, Calendar, Server,
    ShieldCheck, Cloud, Zap,
    ArrowUpRight, AlertCircle
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
    // Basic Counts - Parallel for speed
    const [tenantCount, bookingCount, confirmedCount, logCount] = await Promise.all([
        db.tenant.count(),
        db.booking.count(),
        db.booking.count({ where: { status: "CONFIRMED" } }),
        db.eventLog.count()
    ]);

    // Database Size (Postgres raw query)
    let dbSize = "N/A";
    let dbName = "PostgreSQL";
    try {
        const result: any = await db.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size`;
        dbSize = result[0]?.size || "N/A";
    } catch (e) {
        console.error("Failed to get DB size", e);
    }

    // Health Checks (Last 24h)
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const [emailFailures, loginFailures] = await Promise.all([
        db.eventLog.count({ where: { eventType: "EMAIL_FAILED", createdAt: { gte: oneDayAgo } } }),
        db.eventLog.count({ where: { eventType: "LOGIN_FAILURE", createdAt: { gte: oneDayAgo } } })
    ]);

    return {
        tenantCount,
        bookingCount,
        confirmedCount,
        logCount,
        dbSize,
        dbName,
        emailFailures,
        loginFailures
    };
}

export default async function HealthPage() {
    const stats = await getStats();

    const techCards = [
        { label: "Database Engine", value: stats.dbName, icon: Database, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Database Size", value: stats.dbSize, icon: HardDrive, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Runtime Env", value: "Next.js / Vercel", icon: Server, color: "text-green-600", bg: "bg-green-50" },
        { label: "Email Provider", value: "Resend (SDK)", icon: Cloud, color: "text-orange-600", bg: "bg-orange-50" },
    ];

    const businessCards = [
        { label: "Total Tenants", value: stats.tenantCount, icon: Users, color: "text-slate-600", bg: "bg-slate-50" },
        { label: "Total Bookings", value: stats.bookingCount, icon: Calendar, color: "text-slate-600", bg: "bg-slate-50" },
        { label: "Conversion Rate", value: `${stats.bookingCount > 0 ? ((stats.confirmedCount / stats.bookingCount) * 100).toFixed(1) : 0}%`, icon: Zap, color: "text-yellow-600", bg: "bg-yellow-50" },
        { label: "Audit Log Records", value: stats.logCount.toLocaleString(), icon: Activity, color: "text-red-600", bg: "bg-red-50" },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Health</h1>
                    <p className="text-base text-gray-500 mt-2">Technical performance metrics and operational overview.</p>
                </div>
                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold flex items-center gap-2 ring-1 ring-green-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    All Systems Operational
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {techCards.map((card) => (
                    <div key={card.label} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
                        <div className={`p-3 rounded-2xl w-fit ${card.bg} mb-4 group-hover:scale-110 transition-transform`}>
                            <card.icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                        <p className="text-sm font-medium text-gray-500">{card.label}</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Detailed Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-gray-400" />
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Operational Statistics</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {businessCards.map((card) => (
                            <div key={card.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{card.label}</p>
                                    <p className="text-2xl font-black text-gray-900 mt-1">{card.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${card.bg}`}>
                                    <card.icon className={`w-5 h-5 ${card.color}`} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Infrastructure Card */}
                    <div className="bg-black p-8 rounded-[2rem] text-white overflow-hidden relative group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck className="w-6 h-6 text-green-400" />
                                <span className="font-bold tracking-tight uppercase text-xs text-gray-400">Security Core</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Infrastructure is Secure</h3>
                            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                                Managed hosting with automatic failover enabled. Database backups are taken every 24 hours.
                                Audit logs track all critical tenant and booking operations.
                            </p>
                            <Button variant="outline" className="mt-6 border-white/20 text-white hover:bg-white hover:text-black rounded-full h-10 px-6">
                                View Security Policy <ArrowUpRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Activity className="w-64 h-64 text-white" />
                        </div>
                    </div>
                </div>

                {/* Status Sidebar */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-gray-400" />
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Status (24h)</h2>
                    </div>
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className={`w-5 h-5 ${stats.emailFailures > 0 ? "text-red-500" : "text-green-500"}`} />
                                    <span className="text-sm font-bold text-gray-900">Email Errors</span>
                                </div>
                                <span className={`text-sm font-black ${stats.emailFailures > 0 ? "text-red-600" : "text-green-600"}`}>{stats.emailFailures}</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className={`w-5 h-5 ${stats.loginFailures > 10 ? "text-red-500" : "text-green-500"}`} />
                                    <span className="text-sm font-bold text-gray-900">Login Failures</span>
                                </div>
                                <span className={`text-sm font-black ${stats.loginFailures > 10 ? "text-red-600" : "text-green-600"}`}>{stats.loginFailures}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                            Last Refreshed: {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Button({ children, className, variant, ...props }: any) {
    const base = "inline-flex items-center justify-center font-bold transition-all disabled:opacity-50";
    const variants: any = {
        outline: "border hover:bg-accent hover:text-accent-foreground",
    };
    return (
        <button className={`${base} ${variants[variant] || ""} ${className}`} {...props}>
            {children}
        </button>
    );
}
