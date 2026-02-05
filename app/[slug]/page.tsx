import { getTenantBySlug } from "@/lib/tenants";
import { notFound } from "next/navigation";
import { Phone, Mail } from "lucide-react";
import BookingWizard from "@/components/booking/booking-wizard";

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const tenant = await getTenantBySlug(slug);

    if (!tenant) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                    {tenant.name}
                </h1>
                <div className="mt-4 flex justify-center space-x-6 text-gray-500">
                    {tenant.contactPhone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {tenant.contactPhone}</span>}
                    {tenant.contactEmail && <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {tenant.contactEmail}</span>}
                </div>
            </div>

            <div className="max-w-3xl w-full">
                {/* Info Box */}
                {(() => {
                    const settings = tenant.settings as any;
                    if (settings?.content?.infoBox) {
                        return (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700 whitespace-pre-wrap">
                                            {settings.content.infoBox}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    return null;
                })()}

                <BookingWizard tenant={tenant} />
            </div>

            <div className="mt-8 text-center text-xs text-gray-400">
                Powered by MTBR
            </div>
        </main>
    );
}
