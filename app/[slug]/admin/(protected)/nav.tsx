import { logoutAction } from "../login/actions";
import AdminNavLinks from "./nav-links";

export default function AdminNav({
    slug,
    accountLabel,
}: {
    slug: string;
    accountLabel: string;
}) {
    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 gap-4">
                    <div className="flex min-w-0">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="font-bold text-xl tracking-tight">MTBR Admin</span>
                        </div>
                        <AdminNavLinks slug={slug} />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end leading-tight">
                            <span className="text-sm font-medium text-gray-700">{accountLabel}</span>
                            <span className="text-xs uppercase tracking-wide text-gray-400">Admin</span>
                        </div>

                        <form action={async () => {
                            "use server";
                            await logoutAction(slug);
                        }}>
                            <button
                                type="submit"
                                className="rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:border-red-200 hover:text-red-600"
                            >
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </nav>
    );
}
