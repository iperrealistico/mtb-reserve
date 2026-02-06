import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAboutContent } from "@/lib/about-content";
import HeroSection from "./components/HeroSection";
import WhatIsSection from "./components/WhatIsSection";
import HowItWorksRiders from "./components/HowItWorksRiders";
import HowItWorksShops from "./components/HowItWorksShops";
import ComparisonTable from "./components/ComparisonTable";
import WhyFreeSection from "./components/WhyFreeSection";
import SetupGuideSection from "./components/SetupGuideSection";
import NicheAndLocationsSection from "./components/NicheAndLocationsSection";
import FAQSection from "./components/FAQSection";
import CTASection from "./components/CTASection";

export const metadata: Metadata = {
    title: "MTB Reserve – Free Mountain Bike Rental Booking System for Shops",
    description: "MTB Reserve is the free online booking system for mountain bike and e-bike rentals. No fees, 5-minute setup, pay-at-pickup. Perfect for bike shops and trail rentals.",
    keywords: [
        "mountain bike rental booking system",
        "MTB rental software free",
        "bike rental management tool",
        "online bike reservation",
        "e-bike rental booking",
        "free bike rental software",
        "Checkfront alternative",
        "bike fleet management",
    ],
    openGraph: {
        title: "MTB Reserve – Free Mountain Bike Rental Booking System",
        description: "The free online booking platform for MTB and e-bike rentals. No monthly fees, no commissions. Start in 5 minutes.",
        type: "website",
        url: "/about",
    },
    twitter: {
        card: "summary_large_image",
        title: "MTB Reserve – Free Mountain Bike Rental Booking System",
        description: "The free online booking platform for MTB and e-bike rentals. No monthly fees, no commissions.",
    },
};

export const dynamic = "force-static";
export const revalidate = false;

export default async function AboutPage() {
    const content = await getAboutContent();

    return (
        <main className="min-h-screen bg-white">
            {/* Navigation Back */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Back to MTB Reserve</span>
                    </Link>
                </div>
            </nav>

            {/* Page Content */}
            <HeroSection content={content.hero} />
            <WhatIsSection content={content.whatIs} />
            <HowItWorksRiders
                content={content.howItWorksRiders}
                confirmationContent={content.confirmationFlow}
            />
            <HowItWorksShops
                content={content.howItWorksShops}
                settingsContent={content.settings}
            />
            <ComparisonTable content={content.comparison} />
            <WhyFreeSection content={content.whyFree} />
            <SetupGuideSection
                content={content.setupGuide}
                availabilityContent={content.availability}
            />
            <NicheAndLocationsSection
                nicheContent={content.niche}
                locationsContent={content.locations}
            />
            <FAQSection content={content.faq} />
            <CTASection content={content.cta} />

            {/* Footer */}
            <footer className="py-12 bg-gray-50 border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <p className="text-gray-500 text-sm">
                        MTB Reserve - The free mountain bike rental booking system
                    </p>
                </div>
            </footer>
        </main>
    );
}
