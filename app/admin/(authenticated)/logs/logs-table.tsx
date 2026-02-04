"use client";

import { useState } from "react";
import { format } from "date-fns";
import { LogLevel } from "@prisma/client";


// Inspect existing components?
// I'll stick to basic HTML/Tailwind if I don't know the exact components path, but user said "No emojis... Use the chosen icon system".
// I don't see shadcn components in file list (components/ui is standard but I saw components root).
// Let's assume standard Tailwind and basic modal logic or just a <details> tag for MVP speed if UI lib unknown.
// Actually, file list showed "components.json" which usually implies shadcn.
// Let's check "components/ui" existence.
// If I assume too much, I might break build.
// I'll use simple Overlay/Modal logic using generic Tailwind.

type EventLog = {
    id: string;
    createdAt: Date;
    level: LogLevel;
    eventType: string;
    message: string;
    tenantId: string | null;
    metadata: any;
};

export function LogsTable({ logs }: { logs: EventLog[] }) {
    const [selectedLog, setSelectedLog] = useState<EventLog | null>(null);

    return (
        <>
            <div className="border rounded-md overflow-hidden bg-white shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b text-gray-700 uppercase tracking-wider text-xs font-semibold">
                        <tr>
                            <th className="p-3">Time</th>
                            <th className="p-3">Level</th>
                            <th className="p-3">Event</th>
                            <th className="p-3">Message</th>
                            <th className="p-3">Tenant</th>
                            <th className="p-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-3 whitespace-nowrap text-gray-500">
                                    {format(new Date(log.createdAt), "dd MMM HH:mm:ss")}
                                </td>
                                <td className="p-3">
                                    <Badge level={log.level} />
                                </td>
                                <td className="p-3 font-mono text-xs text-blue-600 font-medium">
                                    {log.eventType}
                                </td>
                                <td className="p-3 text-gray-900 max-w-[300px] truncate" title={log.message}>
                                    {log.message}
                                </td>
                                <td className="p-3 text-gray-500">
                                    {log.tenantId || "-"}
                                </td>
                                <td className="p-3 text-right">
                                    <button
                                        onClick={() => setSelectedLog(log)}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No logs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedLog(null)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-semibold text-lg">{selectedLog.eventType}</h3>
                            <button onClick={() => setSelectedLog(null)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="p-4 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-gray-500 text-xs uppercase">Time</span>
                                    {new Date(selectedLog.createdAt).toISOString()}
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs uppercase">Level</span>
                                    <Badge level={selectedLog.level} />
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs uppercase">Tenant ID</span>
                                    <span className="font-mono bg-gray-100 px-1 rounded">{selectedLog.tenantId || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 text-xs uppercase">Actor</span>
                                    ID: {selectedLog.metadata?.actorType || '-'}
                                </div>
                            </div>

                            <div>
                                <span className="block text-gray-500 text-xs uppercase mb-1">Message</span>
                                <p className="p-2 bg-gray-50 rounded border">{selectedLog.message}</p>
                            </div>

                            <div>
                                <span className="block text-gray-500 text-xs uppercase mb-1">Metadata</span>
                                <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto font-mono">
                                    {JSON.stringify(selectedLog.metadata, null, 2)}
                                </pre>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end">
                            <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function Badge({ level }: { level: string }) {
    let color = "bg-gray-100 text-gray-800 border-gray-200";
    if (level === 'ERROR') color = "bg-red-50 text-red-700 border-red-200";
    if (level === 'WARN') color = "bg-amber-50 text-amber-700 border-amber-200";
    if (level === 'INFO') color = "bg-sky-50 text-sky-700 border-sky-200";

    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider border ${color}`}>
            {level}
        </span>
    );
}
