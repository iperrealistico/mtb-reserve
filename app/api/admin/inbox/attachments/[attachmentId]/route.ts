import { ensureSuperAdmin } from "@/lib/auth";
import { getInboxAttachmentDownloadUrl } from "@/lib/mailbox";
import { NextResponse } from "next/server";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ attachmentId: string }> },
) {
    await ensureSuperAdmin();
    const { attachmentId } = await params;

    const downloadUrl = await getInboxAttachmentDownloadUrl(attachmentId);
    return NextResponse.redirect(downloadUrl);
}
