"use client";

import { useState } from "react";
import RichTextEditor from "./rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveEmailTemplateAction } from "./actions";
import { toast } from "sonner";
import {
    Info, Save, RotateCcw,
    Mail, Layout, Code2,
    CheckCircle2, AlertCircle
} from "lucide-react";

export type TemplateConfig = {
    id: string;
    label: string;
    description: string;
    placeholders: string[];
    defaultSubject: string;
    defaultHtml: string;
};

export const TEMPLATES: TemplateConfig[] = [
    {
        id: "confirmation",
        label: "Booking Confirmation Link",
        description: "Sent to guests immediately after they fill out the booking form.",
        placeholders: ["{{link}}", "{{tenantName}}"],
        defaultSubject: "Confirm your MTB Booking",
        defaultHtml: `<p>Please click here to confirm your booking: <a href="{{link}}">{{link}}</a></p><p>This link expires in 30 minutes.</p>`
    },
    {
        id: "recap",
        label: "Booking Receipt (Recap)",
        description: "Sent to guests after they confirm their booking via email.",
        placeholders: ["{{bookingCode}}", "{{date}}", "{{time}}", "{{bike}}", "{{quantity}}", "{{customerName}}", "{{pickupUrl}}", "{{tenantName}}", "{{tenantEmail}}"],
        defaultSubject: "Booking Confirmed - {{bookingCode}}",
        defaultHtml: `<h1>Ready to ride!</h1><p>Your booking is confirmed.</p><p><strong>Booking Code:</strong> {{bookingCode}}</p><ul><li><strong>Date:</strong> {{date}}</li><li><strong>Time:</strong> {{time}}</li><li><strong>Bike:</strong> {{bike}}</li><li><strong>Quantity:</strong> {{quantity}}</li></ul><p>See you soon!</p>`
    },
    {
        id: "admin_notification",
        label: "Admin New Booking Alert",
        description: "Sent to the tenant admin when a new booking is confirmed.",
        placeholders: ["{{customerName}}", "{{customerPhone}}", "{{customerEmail}}", "{{date}}", "{{time}}", "{{bike}}", "{{quantity}}", "{{bookingCode}}"],
        defaultSubject: "New Booking: {{customerName}} [{{bookingCode}}]",
        defaultHtml: `<h2>New Booking Confirmed</h2><p><strong>Customer:</strong> {{customerName}}</p><p><strong>Phone:</strong> {{customerPhone}}</p><p><strong>Date:</strong> {{date}}</p><p><strong>Time:</strong> {{time}}</p><p><strong>Bike:</strong> {{bike}} x {{quantity}}</p>`
    },
    {
        id: "onboarding",
        label: "Tenant Welcome (Onboarding)",
        description: "Sent to new tenants with their credentials.",
        placeholders: ["{{name}}", "{{slug}}", "{{registrationEmail}}", "{{password}}", "{{loginUrl}}"],
        defaultSubject: "Welcome to MTB Reserve - Your Admin Access",
        defaultHtml: `<h1>Welcome, {{name}}!</h1><p>Your tenant account has been created.</p><p><strong>Login:</strong> <a href="{{loginUrl}}">{{loginUrl}}</a></p><p><strong>Username:</strong> {{registrationEmail}}</p><p><strong>Password:</strong> {{password}}</p>`
    },
    {
        id: "password_reset",
        label: "Password Reset Request",
        description: "Sent when an admin clicks 'Forgot Password'.",
        placeholders: ["{{tenantName}}", "{{link}}"],
        defaultSubject: "Reset Password for {{tenantName}}",
        defaultHtml: `<p>You requested a password reset. Click below to continue:</p><p><a href="{{link}}">{{link}}</a></p>`
    },
    {
        id: "signup_request",
        label: "Homepage Join Request",
        description: "Sent to the new user after they request to join via the homepage form.",
        placeholders: ["{{firstName}}"],
        defaultSubject: "We received your request!",
        defaultHtml: `<h1>Hi {{firstName}},</h1><p>Thanks for your interest in joining MTB Reserve. We have received your details and will get back to you shortly.</p>`
    }
];

export default function TemplateEditor({ initialTemplates }: { initialTemplates: any[] }) {
    const [selectedId, setSelectedId] = useState(TEMPLATES[0].id);
    const [loading, setLoading] = useState(false);

    const activeConfig = TEMPLATES.find(t => t.id === selectedId)!;
    const initialData = initialTemplates.find(t => t.id === selectedId) || {
        subject: activeConfig.defaultSubject,
        html: activeConfig.defaultHtml,
        senderName: "",
        senderEmail: ""
    };

    const [subject, setSubject] = useState(initialData.subject);
    const [html, setHtml] = useState(initialData.html);
    const [senderName, setSenderName] = useState(initialData.senderName || "");
    const [senderEmail, setSenderEmail] = useState(initialData.senderEmail || "");

    // Sync state when switching templates
    const handleSelect = (id: string) => {
        const config = TEMPLATES.find(t => t.id === id)!;
        const data = initialTemplates.find(t => t.id === id) || {
            subject: config.defaultSubject,
            html: config.defaultHtml,
            senderName: "",
            senderEmail: ""
        };
        setSelectedId(id);
        setSubject(data.subject);
        setHtml(data.html);
        setSenderName(data.senderName || "");
        setSenderEmail(data.senderEmail || "");
    };

    const handleSave = async () => {
        if (senderEmail && !senderEmail.endsWith("@mtbreserve.com")) {
            toast.error("Sender email must end with @mtbreserve.com");
            return;
        }

        setLoading(true);
        const result = await saveEmailTemplateAction(selectedId, subject, html, senderName, senderEmail);
        if (result.success) {
            toast.success("Template saved successfully");
            // Optionally update local list of initialTemplates if we want to keep it in sync without re-fetching
        } else {
            toast.error(result.error);
        }
        setLoading(false);
    };

    const handleReset = () => {
        if (confirm("Restore to default? This will clear your customizations for this template.")) {
            setSubject(activeConfig.defaultSubject);
            setHtml(activeConfig.defaultHtml);
            setSenderName("");
            setSenderEmail("");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2 mb-4">Email Scenarios</p>
                {TEMPLATES.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => handleSelect(t.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${selectedId === t.id
                            ? "bg-black text-white shadow-lg shadow-black/10 scale-[1.02]"
                            : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-100"
                            }`}
                    >
                        <div className={`p-1.5 rounded-lg ${selectedId === t.id ? "bg-white/10" : "bg-gray-100 group-hover:bg-white"}`}>
                            {selectedId === t.id ? <Mail className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-medium truncate">{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Main Editor */}
            <div className="lg:col-span-3 space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 pb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{activeConfig.label}</h2>
                            <p className="text-sm text-gray-500 mt-1">{activeConfig.description}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleReset} className="rounded-xl">
                                <RotateCcw className="w-4 h-4 mr-2" /> Reset
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={loading} className="rounded-xl bg-black hover:bg-black/90 text-white">
                                <Save className="w-4 h-4 mr-2" /> {loading ? "Saving..." : "Save Template"}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Sender Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="space-y-2">
                                <Label htmlFor="senderName" className="text-xs font-bold uppercase text-gray-400 tracking-wider">Sender Name</Label>
                                <Input
                                    id="senderName"
                                    value={senderName}
                                    onChange={(e) => setSenderName(e.target.value)}
                                    className="rounded-lg bg-white"
                                    placeholder="e.g. MTB Reserve Team"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="senderEmail" className="text-xs font-bold uppercase text-gray-400 tracking-wider">Sender Email</Label>
                                <Input
                                    id="senderEmail"
                                    value={senderEmail}
                                    onChange={(e) => setSenderEmail(e.target.value)}
                                    className="rounded-lg bg-white"
                                    placeholder="e.g. support@mtbreserve.com"
                                />
                                <p className="text-[10px] text-gray-500">Must end in @mtbreserve.com</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-xs font-bold uppercase text-gray-400 tracking-wider">Subject Line</Label>
                            <Input
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="rounded-xl border-gray-100 h-12 text-lg font-medium focus:ring-black"
                                placeholder="Email subject..."
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Body Content</Label>
                                <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full font-bold">
                                    <Code2 className="w-3 h-3" /> HTML SUPPORTED
                                </div>
                            </div>
                            <RichTextEditor
                                content={html}
                                onChange={setHtml}
                                key={selectedId} // Force remount when switching templates
                            />
                        </div>
                    </div>

                    {/* Placeholders Info */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                            <Info className="w-4 h-4 text-indigo-500" /> Available Placeholders
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                            {activeConfig.placeholders.map((p) => (
                                <code key={p} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-indigo-600 font-mono text-xs">
                                    {p}
                                </code>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">Placeholders will be automatically replaced with real values when the email is sent.</p>
                    </div>
                </div>

                {/* Preview Tip */}
                <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-indigo-900">Pro Tip: Personalization</p>
                        <p className="text-xs text-indigo-700 mt-0.5">Using placeholders increases engagement and trust with your users.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
