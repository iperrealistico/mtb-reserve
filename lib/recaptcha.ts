
export async function verifyRecaptcha(token: string): Promise<boolean> {
    const secret = process.env.RECAPTCHA_SECRET_KEY;

    // Bypass for dev/test if disabled. NEVER in production.
    if (process.env.NODE_ENV !== "production" && process.env.RECAPTCHA_DISABLED === "1") {
        console.warn("⚠️ RECAPTCHA_DISABLED is active. Skipping verification.");
        return true;
    }

    if (!token) return false;
    if (!secret) {
        console.error("RECAPTCHA_SECRET_KEY is not set");
        return false; // Fail secure
    }

    try {
        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `secret=${secret}&response=${token}`,
        });

        const data = await response.json();
        if (!data.success) {
            console.warn("Recaptcha failed:", data["error-codes"]);
        }
        return data.success;
    } catch (error) {
        console.error("Recaptcha verification error:", error);
        return false;
    }
}
