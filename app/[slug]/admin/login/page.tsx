import LoginForm from "./login-form";

import { getTenantBySlug } from "@/lib/tenants";

export default async function LoginPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const tenant = await getTenantBySlug(slug);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-4xl font-extrabold text-gray-900 tracking-tight">
                    MTB Reserve
                </h1>
                <p className="mt-2 text-center text-lg text-gray-600">
                    Admin Portal
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <LoginForm slug={slug} />
            </div>
        </div>
    );
}
