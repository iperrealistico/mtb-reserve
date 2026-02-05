"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Check, AlertCircle } from "lucide-react";
import { updateSiteSettingsAction, uploadFaviconAction, uploadSocialImageAction } from "./actions";
import { SiteSettings } from "@/lib/site-settings";

export default function SiteSettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
    const [seoState, seoAction, seoIsPending] = useActionState(updateSiteSettingsAction, { success: false, error: "" });
    const [faviconState, faviconAction, faviconIsPending] = useActionState(uploadFaviconAction, { success: false, error: "" });
    const [socialState, socialAction, socialIsPending] = useActionState(uploadSocialImageAction, { success: false, error: "" });

    return (
        <div className="space-y-8">
            {/* SEO Settings */}
            <div className="bg-white p-6 shadow rounded-lg">
                <h2 className="text-lg font-medium mb-4">SEO Settings</h2>
                <form action={seoAction} className="space-y-4 max-w-xl">
                    <div className="space-y-2">
                        <Label htmlFor="serpTitle">Site Title (SERP)</Label>
                        <Input
                            id="serpTitle"
                            name="serpTitle"
                            defaultValue={initialSettings.serpTitle}
                            placeholder="MTB Reserve - Bike Rental Platform"
                        />
                        <p className="text-xs text-gray-500">Appears in browser tabs and search results</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="serpDescription">Meta Description</Label>
                        <textarea
                            id="serpDescription"
                            name="serpDescription"
                            rows={3}
                            defaultValue={initialSettings.serpDescription}
                            placeholder="Book mountain bikes and e-bikes from local rental shops..."
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        />
                        <p className="text-xs text-gray-500">155-160 characters recommended for search snippets</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="seoKeywords">SEO Keywords</Label>
                        <Input
                            id="seoKeywords"
                            name="seoKeywords"
                            defaultValue={initialSettings.seoKeywords?.join(", ")}
                            placeholder="bike rental, mountain bike, e-bike, booking"
                        />
                        <p className="text-xs text-gray-500">Comma-separated keywords</p>
                    </div>

                    {seoState.success && (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                            <Check className="w-4 h-4" /> Settings saved
                        </div>
                    )}
                    {seoState.error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" /> {seoState.error}
                        </div>
                    )}

                    <Button type="submit" disabled={seoIsPending}>
                        {seoIsPending ? "Saving..." : "Save SEO Settings"}
                    </Button>
                </form>
            </div>

            {/* Email Configuration */}
            <div className="bg-white p-6 shadow rounded-lg">
                <h2 className="text-lg font-medium mb-4">Email Configuration</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Configure the sender addresses for different types of automated emails.
                </p>
                <form action={seoAction} className="space-y-4 max-w-xl">
                    {/* Hidden fields to preserve other settings */}
                    <input type="hidden" name="serpTitle" value={initialSettings.serpTitle} />
                    <input type="hidden" name="serpDescription" value={initialSettings.serpDescription} />
                    <input type="hidden" name="seoKeywords" value={initialSettings.seoKeywords.join(", ")} />

                    <div className="space-y-2">
                        <Label htmlFor="senderEmailBooking">Booking Notifications Email</Label>
                        <Input
                            id="senderEmailBooking"
                            name="senderEmailBooking"
                            defaultValue={initialSettings.senderEmailBooking}
                            placeholder="bookings@mtbreserve.com"
                        />
                        <p className="text-xs text-gray-500">Used for confirmation links and booking receipts.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="senderEmailTech">Technical/System Email</Label>
                        <Input
                            id="senderEmailTech"
                            name="senderEmailTech"
                            defaultValue={initialSettings.senderEmailTech}
                            placeholder="tech@mtbreserve.com"
                        />
                        <p className="text-xs text-gray-500">Used for password resets and system alerts.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="senderEmailDirect">Direct Communication Email</Label>
                        <Input
                            id="senderEmailDirect"
                            name="senderEmailDirect"
                            defaultValue={initialSettings.senderEmailDirect}
                            placeholder="direct@mtbreserve.com"
                        />
                        <p className="text-xs text-gray-500">Used when sending manual emails from the admin panel.</p>
                    </div>

                    <Button type="submit" disabled={seoIsPending}>
                        {seoIsPending ? "Saving..." : "Save Email Settings"}
                    </Button>
                </form>
            </div>

            {/* Favicon Upload */}
            <div className="bg-white p-6 shadow rounded-lg">
                <h2 className="text-lg font-medium mb-4">Favicon</h2>
                <div className="flex items-start gap-6">
                    {initialSettings.faviconUrl && (
                        <div className="flex-shrink-0">
                            <p className="text-xs text-gray-500 mb-2">Current</p>
                            <img
                                src={initialSettings.faviconUrl}
                                alt="Current favicon"
                                className="w-16 h-16 border rounded"
                            />
                        </div>
                    )}
                    <form action={faviconAction} className="flex-1 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="favicon">Upload New Favicon</Label>
                            <Input
                                id="favicon"
                                name="favicon"
                                type="file"
                                accept=".png,.ico,.svg,.jpg,.jpeg"
                            />
                            <p className="text-xs text-gray-500">PNG, ICO, or SVG. Recommended size: 512x512px</p>
                        </div>

                        {faviconState.success && (
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                                <Check className="w-4 h-4" /> Favicon uploaded
                            </div>
                        )}
                        {faviconState.error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4" /> {faviconState.error}
                            </div>
                        )}

                        <Button type="submit" variant="outline" disabled={faviconIsPending}>
                            <Upload className="w-4 h-4 mr-2" />
                            {faviconIsPending ? "Uploading..." : "Upload Favicon"}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Social Image Upload */}
            <div className="bg-white p-6 shadow rounded-lg">
                <h2 className="text-lg font-medium mb-4">Social Preview Image</h2>
                <p className="text-sm text-gray-600 mb-4">
                    This image appears when your site is shared on social media (OpenGraph/Twitter cards).
                </p>
                <div className="flex items-start gap-6">
                    {initialSettings.socialImageUrl && (
                        <div className="flex-shrink-0">
                            <p className="text-xs text-gray-500 mb-2">Current</p>
                            <img
                                src={initialSettings.socialImageUrl}
                                alt="Current social image"
                                className="w-48 h-24 object-cover border rounded"
                            />
                        </div>
                    )}
                    <form action={socialAction} className="flex-1 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="socialImage">Upload New Image</Label>
                            <Input
                                id="socialImage"
                                name="socialImage"
                                type="file"
                                accept=".png,.jpg,.jpeg,.webp"
                            />
                            <p className="text-xs text-gray-500">PNG, JPEG, or WebP. Recommended size: 1200x630px</p>
                        </div>

                        {socialState.success && (
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                                <Check className="w-4 h-4" /> Image uploaded
                            </div>
                        )}
                        {socialState.error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4" /> {socialState.error}
                            </div>
                        )}

                        <Button type="submit" variant="outline" disabled={socialIsPending}>
                            <Upload className="w-4 h-4 mr-2" />
                            {socialIsPending ? "Uploading..." : "Upload Image"}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Admin Password Change - Added as requested */}
            <div className="bg-white p-6 shadow rounded-lg">
                <h2 className="text-lg font-medium mb-4">Security</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Update your Super Admin password.
                </p>
                <PasswordChangeForm />
            </div>
        </div>
    );
}

import { changeSuperAdminPasswordAction } from "./actions";

function PasswordChangeForm() {
    const [state, action, isPending] = useActionState(changeSuperAdminPasswordAction, { success: false, error: "" });

    return (
        <form action={action} className="space-y-4 max-w-xl">
            <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    minLength={8}
                />
                <p className="text-xs text-gray-500">
                    Must be at least 8 characters, include a number and an uppercase letter.
                </p>
            </div>

            {state.success && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Check className="w-4 h-4" /> Password updated successfully
                </div>
            )}
            {state.error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" /> {state.error}
                </div>
            )}

            <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Password"}
            </Button>
        </form>
    );
}
