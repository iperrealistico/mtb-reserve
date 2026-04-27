"use client";

import { createElement, useEffect, useState } from "react";

export default function AltchaWidget({
    challengeUrl,
    className,
}: {
    challengeUrl: string;
    className?: string;
}) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let isMounted = true;

        import("altcha")
            .then(() => {
                if (isMounted) {
                    setReady(true);
                }
            })
            .catch((error) => {
                console.error("Failed to load ALTCHA widget", error);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    if (!ready) {
        return (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-400">
                Loading verification challenge...
            </div>
        );
    }

    return createElement("altcha-widget", {
        challenge: challengeUrl,
        className,
        hidefooter: true,
        name: "altcha",
        theme: "business",
    });
}
