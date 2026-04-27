import { headers } from "next/headers";

export function getBaseUrl() {
    return process.env.NEXT_PUBLIC_BASE_URL || "https://www.mtbreserve.com";
}

export async function getRequestIp() {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    if (!forwardedFor) {
        return "127.0.0.1";
    }

    return forwardedFor.split(",")[0]?.trim() || "127.0.0.1";
}
