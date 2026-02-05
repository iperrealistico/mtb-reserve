"use client";

import { useEffect } from "react";
import { useSound } from "@/lib/sound";

export default function GlobalClickListener() {
    const { play } = useSound();

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if character is a button, input, textarea, select, or inside a link/button
            const isInteractive =
                target.tagName === "BUTTON" ||
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.tagName === "SELECT" ||
                target.closest("button") ||
                target.closest("a");

            if (isInteractive) {
                play("click");
            }
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [play]);

    return null;
}
