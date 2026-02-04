"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Calendar, Package, Settings, LogOut } from "lucide-react";

export default function AdminNav({ slug }: { slug: string }) {
    const pathname = usePathname();

    const links = [
        { href: `/${slug}/admin/dashboard`, label: "Today", icon: LayoutDashboard },
        { href: `/${slug}/admin/calendar`, label: "Calendar", icon: Calendar },
        { href: `/${slug}/admin/inventory`, label: "Inventory", icon: Package },
        { href: `/${slug}/admin/settings`, label: "Settings", icon: Settings },
    ];

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="font-bold text-xl tracking-tight">MTBR Admin</span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {links.map((link) => {
                                const isActive = pathname.startsWith(link.href);
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
                        <div className="flex-shrink-0">
                            <span className="text-gray-500 text-sm mr-4 capitalize">{slug}</span>
                            {/* Logout would be a form action, simplified here just a link or button */}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
