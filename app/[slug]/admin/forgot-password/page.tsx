import ForgotPasswordForm from "./forgot-password-form";
import Link from "next/link";

export default async function ForgotPasswordPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Reset Password
                </h1>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your admin email to receive reset instructions.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <ForgotPasswordForm slug={slug} />

                    <div className="mt-6 text-center">
                        <Link href={`/${slug}/admin/login`} className="font-medium text-indigo-600 hover:text-indigo-500">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
