"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building2, Settings, Activity, Mail, Terminal, HeartPulse, FileText } from "lucide-react";

export default function SuperAdminNav() {
    const pathname = usePathname();

    const links = [
        { href: "/admin", label: "Tenants", icon: Building2, exact: true },
        { href: "/admin/settings", label: "Settings", icon: Settings },
        { href: "/admin/about", label: "About Page", icon: FileText },
        { href: "/admin/emails", label: "Emails", icon: Mail },
        { href: "/admin/logs", label: "Logs", icon: Terminal },
        { href: "/admin/health", label: "Health", icon: HeartPulse },
    ];

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="font-bold text-xl tracking-tight">Tenant Management Console</span>
                        </div>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            {links.map((link) => {
                                const isActive = link.exact
                                    ? pathname === link.href
                                    : pathname.startsWith(link.href);
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                                            isActive
                                                ? "border-black text-gray-900"
                                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                        )}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="text-gray-500 text-sm mr-4">Super Admin</span>
                    </div>
                </div>
            </div>
        </nav>
    );
}
