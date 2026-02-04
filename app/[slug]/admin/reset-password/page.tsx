import ResetForm from "./reset-form";
import { redirect } from "next/navigation";

export default async function ResetPasswordPage({
    params,
    searchParams
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ token?: string }>
}) {
    const { slug } = await params;
    const { token } = await searchParams;

    if (!token) {
        redirect(`/${slug}/admin/login`);
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Reset Password
                </h1>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Securely generate a new password for your account.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <ResetForm slug={slug} token={token} />
            </div>
        </div>
    );
}
