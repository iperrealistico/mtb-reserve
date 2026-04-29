"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Package, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

export default function AdminNavLinks({ slug }: { slug: string }) {
    const pathname = usePathname();

    const links = [
        { href: `/${slug}/admin/dashboard`, label: "Today", icon: LayoutDashboard },
        { href: `/${slug}/admin/calendar`, label: "Calendar", icon: Calendar },
        { href: `/${slug}/admin/inventory`, label: "Inventory", icon: Package },
        { href: `/${slug}/admin/settings`, label: "Settings", icon: Settings },
    ];

    return (
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
    );
}
