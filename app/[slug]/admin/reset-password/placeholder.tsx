"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "./actions"; // Using server action

const initialState = {
    error: "",
    success: false,
    newPassword: "",
};

export default function ResetPasswordPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ token?: string }> }) {
    // Need to unwrap promises in Next 15
    // But this is a client component, so we should receive them as resolved props if passed from a Server Component wrapper?
    // Actually, page.tsx is Server Component by default unless "use client" is at top. 
    // Here I put "use client" because I want to use `useActionState`.
    // BUT `params` and `searchParams` are promises in Next 15.

    // Better pattern: Wrapper Server Component -> Client Form.
    // Let's rewrite this file as a Client Component that takes props, or handle hook properly.
    // For simplicity, let's make the default export a Server Component that renders a Client Form.

    // Wait, I cannot export default Async Server Component if I have "use client".
    // I will split this into page.tsx (server) and reset-form.tsx (client).
    return null;
}
