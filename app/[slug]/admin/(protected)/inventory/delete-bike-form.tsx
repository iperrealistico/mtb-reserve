"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteBikeTypeAction } from "./actions";

export default function DeleteBikeForm({ id, slug }: { id: string, slug: string }) {
    const handleSubmit = (e: React.FormEvent) => {
        if (!confirm("Are you sure? This will delete all associated bookings.")) {
            e.preventDefault();
        }
    };

    return (
        <form action={deleteBikeTypeAction as any} onSubmit={handleSubmit}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="slug" value={slug} />
            <Button size="sm" type="submit" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
            </Button>
        </form>
    );
}
