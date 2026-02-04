import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");

    // Content Security Policy
    // We allow 'unsafe-inline' and 'unsafe-eval' for now to ensure compatibility with Next.js specific client-side hydration and dev mode.
    // In a strict production environment, we would use nonces.
    const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https://www.google.com https://www.gstatic.com;
        font-src 'self';
        frame-src 'self' https://www.google.com https://www.gstatic.com;
        connect-src 'self' https://www.google.com https://www.gstatic.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        block-all-mixed-content;
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, " ").trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", cspHeader);

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    response.headers.set("Content-Security-Policy", cspHeader);
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        {
            source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
            missing: [
                { type: "header", key: "next-router-prefetch" },
                { type: "header", key: "purpose", value: "prefetch" },
            ],
        },
    ],
};
