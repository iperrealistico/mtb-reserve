"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, Loader2, ChevronDown, ChevronRight, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AboutPageContent } from "@/lib/about-content";
import { saveAboutPageAction } from "./actions";

interface AboutFormProps {
    initialContent: AboutPageContent;
}

interface SectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = false }: SectionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <h3 className="font-semibold text-gray-900">{title}</h3>
                {open ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
            </button>
            {open && <div className="p-6 space-y-4">{children}</div>}
        </div>
    );
}

export default function AboutForm({ initialContent }: AboutFormProps) {
    const [content, setContent] = useState<AboutPageContent>(initialContent);
    const [saving, setSaving] = useState(false);

    const updateField = <K extends keyof AboutPageContent>(
        section: K,
        field: keyof AboutPageContent[K],
        value: any
    ) => {
        setContent((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await saveAboutPageAction(content);
            if (result.success) {
                toast.success(
                    result.rebuildTriggered
                        ? "Content saved! Rebuild triggered."
                        : "Content saved. Note: Rebuild hook not configured."
                );
            } else {
                toast.error(result.error || "Failed to save");
            }
        } catch (e) {
            toast.error("An error occurred while saving");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <Section title="Hero Section" defaultOpen>
                <div className="grid gap-4">
                    <div>
                        <Label htmlFor="hero-title">Title (H1)</Label>
                        <Input
                            id="hero-title"
                            value={content.hero.title}
                            onChange={(e) => updateField("hero", "title", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="hero-subtitle">Subtitle</Label>
                        <Input
                            id="hero-subtitle"
                            value={content.hero.subtitle}
                            onChange={(e) => updateField("hero", "subtitle", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="hero-description">Description</Label>
                        <Textarea
                            id="hero-description"
                            value={content.hero.description}
                            onChange={(e) => updateField("hero", "description", e.target.value)}
                            rows={4}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="hero-cta-rider">Rider CTA Text</Label>
                            <Input
                                id="hero-cta-rider"
                                value={content.hero.ctaRider}
                                onChange={(e) => updateField("hero", "ctaRider", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="hero-cta-shop">Shop CTA Text</Label>
                            <Input
                                id="hero-cta-shop"
                                value={content.hero.ctaShop}
                                onChange={(e) => updateField("hero", "ctaShop", e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="hero-image">Hero Image URL (optional)</Label>
                        <Input
                            id="hero-image"
                            value={content.hero.heroImage || ""}
                            onChange={(e) => updateField("hero", "heroImage", e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                </div>
            </Section>

            {/* What Is Section */}
            <Section title="What Is MTB Reserve">
                <div className="grid gap-4">
                    <div>
                        <Label htmlFor="whatis-title">Section Title (H2)</Label>
                        <Input
                            id="whatis-title"
                            value={content.whatIs.title}
                            onChange={(e) => updateField("whatIs", "title", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Main Paragraphs</Label>
                        {content.whatIs.paragraphs.map((para, index) => (
                            <Textarea
                                key={index}
                                value={para}
                                onChange={(e) => {
                                    const newParagraphs = [...content.whatIs.paragraphs];
                                    newParagraphs[index] = e.target.value;
                                    updateField("whatIs", "paragraphs", newParagraphs);
                                }}
                                rows={3}
                                className="mt-2"
                            />
                        ))}
                    </div>
                    <div>
                        <Label htmlFor="whatis-why-title">Why We Built Title</Label>
                        <Input
                            id="whatis-why-title"
                            value={content.whatIs.whyBuiltTitle}
                            onChange={(e) => updateField("whatIs", "whyBuiltTitle", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="whatis-why-para">Why We Built Paragraph</Label>
                        <Textarea
                            id="whatis-why-para"
                            value={content.whatIs.whyBuiltParagraph}
                            onChange={(e) => updateField("whatIs", "whyBuiltParagraph", e.target.value)}
                            rows={4}
                        />
                    </div>
                    <div>
                        <Label htmlFor="whatis-image">Section Image URL (optional)</Label>
                        <Input
                            id="whatis-image"
                            value={content.whatIs.image || ""}
                            onChange={(e) => updateField("whatIs", "image", e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                </div>
            </Section>

            {/* Comparison Section */}
            <Section title="Competitor Comparison">
                <div className="grid gap-4">
                    <div>
                        <Label htmlFor="comp-title">Section Title (H2)</Label>
                        <Input
                            id="comp-title"
                            value={content.comparison.title}
                            onChange={(e) => updateField("comparison", "title", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="comp-intro">Intro Text</Label>
                        <Textarea
                            id="comp-intro"
                            value={content.comparison.intro}
                            onChange={(e) => updateField("comparison", "intro", e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div>
                        <Label htmlFor="comp-image">Section Image URL (optional)</Label>
                        <Input
                            id="comp-image"
                            value={content.comparison.image || ""}
                            onChange={(e) => updateField("comparison", "image", e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                </div>
            </Section>

            {/* Why Free Section */}
            <Section title="Why Free">
                <div className="grid gap-4">
                    <div>
                        <Label htmlFor="free-title">Section Title (H2)</Label>
                        <Input
                            id="free-title"
                            value={content.whyFree.title}
                            onChange={(e) => updateField("whyFree", "title", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="free-nocatch">No Catch Title</Label>
                        <Input
                            id="free-nocatch"
                            value={content.whyFree.noCatchTitle}
                            onChange={(e) => updateField("whyFree", "noCatchTitle", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="free-image">Section Image URL (optional)</Label>
                        <Input
                            id="free-image"
                            value={content.whyFree.image || ""}
                            onChange={(e) => updateField("whyFree", "image", e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                </div>
            </Section>

            {/* Locations Section */}
            <Section title="Locations">
                <div className="grid gap-4">
                    <div>
                        <Label htmlFor="loc-title">Section Title</Label>
                        <Input
                            id="loc-title"
                            value={content.locations.title}
                            onChange={(e) => updateField("locations", "title", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="loc-intro">Intro Text</Label>
                        <Textarea
                            id="loc-intro"
                            value={content.locations.intro}
                            onChange={(e) => updateField("locations", "intro", e.target.value)}
                            rows={2}
                        />
                    </div>
                    <div>
                        <Label>Current Locations (one per line)</Label>
                        <Textarea
                            value={content.locations.currentLocations.join("\n")}
                            onChange={(e) => updateField("locations", "currentLocations", e.target.value.split("\n").filter(Boolean))}
                            rows={4}
                        />
                    </div>
                    <div>
                        <Label htmlFor="loc-seo-title">Local SEO Title</Label>
                        <Input
                            id="loc-seo-title"
                            value={content.locations.localSeoTitle}
                            onChange={(e) => updateField("locations", "localSeoTitle", e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="loc-image">Section Image URL (optional)</Label>
                        <Input
                            id="loc-image"
                            value={content.locations.image || ""}
                            onChange={(e) => updateField("locations", "image", e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                </div>
            </Section>

            {/* CTA Section */}
            <Section title="Call to Action">
                <div className="grid gap-4">
                    <div>
                        <Label htmlFor="cta-title">Section Title</Label>
                        <Input
                            id="cta-title"
                            value={content.cta.title}
                            onChange={(e) => updateField("cta", "title", e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="cta-rider-title">Rider Card Title</Label>
                            <Input
                                id="cta-rider-title"
                                value={content.cta.riderTitle}
                                onChange={(e) => updateField("cta", "riderTitle", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="cta-shop-title">Shop Card Title</Label>
                            <Input
                                id="cta-shop-title"
                                value={content.cta.shopTitle}
                                onChange={(e) => updateField("cta", "shopTitle", e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="cta-rider-desc">Rider Card Description</Label>
                            <Textarea
                                id="cta-rider-desc"
                                value={content.cta.riderDescription}
                                onChange={(e) => updateField("cta", "riderDescription", e.target.value)}
                                rows={2}
                            />
                        </div>
                        <div>
                            <Label htmlFor="cta-shop-desc">Shop Card Description</Label>
                            <Textarea
                                id="cta-shop-desc"
                                value={content.cta.shopDescription}
                                onChange={(e) => updateField("cta", "shopDescription", e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="cta-image">Final Image URL (optional)</Label>
                        <Input
                            id="cta-image"
                            value={content.cta.image || ""}
                            onChange={(e) => updateField("cta", "image", e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                </div>
            </Section>

            {/* Save Button */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-12 px-8 text-base font-semibold"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Save Changes & Rebuild
                        </>
                    )}
                </Button>
                <p className="text-sm text-gray-500">
                    Changes will be saved and a site rebuild will be triggered.
                </p>
            </div>
        </div>
    );
}
