"use client";

import { ImageIcon } from "lucide-react";

interface PhotoPlaceholderProps {
    label: string;
    aspectRatio?: "square" | "video" | "wide" | "tall";
    className?: string;
}

export default function PhotoPlaceholder({
    label,
    aspectRatio = "video",
    className = "",
}: PhotoPlaceholderProps) {
    const ratioClasses = {
        square: "aspect-square",
        video: "aspect-video",
        wide: "aspect-[21/9]",
        tall: "aspect-[3/4]",
    };

    return (
        <div
            className={`
                relative bg-gradient-to-br from-gray-100 to-gray-50 
                border-2 border-dashed border-gray-200 
                rounded-2xl overflow-hidden
                flex flex-col items-center justify-center
                ${ratioClasses[aspectRatio]}
                ${className}
            `}
        >
            <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="p-4 bg-gray-100 rounded-full">
                    <ImageIcon className="w-8 h-8" />
                </div>
                <span className="text-sm font-medium text-center px-4">{label}</span>
            </div>
        </div>
    );
}
