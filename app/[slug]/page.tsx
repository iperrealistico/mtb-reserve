import { getTenantBySlug } from "@/lib/tenants";
import { notFound } from "next/navigation";
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
                    {tenant.contactPhone && <span>📞 {tenant.contactPhone}</span>}
                    {tenant.contactEmail && <span>✉️ {tenant.contactEmail}</span>}
                </div>
            </div>

            <div className="max-w-3xl w-full">
                <BookingWizard tenant={tenant} />
            </div>

            <div className="mt-8 text-center text-xs text-gray-400">
                Powered by MTBR
            </div>
        </main>
    );
}
