import { db } from "@/lib/db";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface HeroContent {
    title: string;
    subtitle: string;
    description: string;
    ctaRider: string;
    ctaShop: string;
    heroImage?: string;
}

export interface WhatIsContent {
    title: string;
    paragraphs: string[];
    whyBuiltTitle: string;
    whyBuiltParagraph: string;
    whoUsesTitle: string;
    whoUsesList: string[];
    image?: string;
}

export interface BookingStep {
    title: string;
    description: string;
    screenshotPlaceholder?: string;
}

export interface HowItWorksRidersContent {
    title: string;
    intro: string;
    steps: BookingStep[];
}

export interface ConfirmationFlowContent {
    title: string;
    intro: string;
    steps: string[];
    bookingCodeDescription: string;
}

export interface AdminFeature {
    title: string;
    description: string;
    bullets?: string[];
    screenshotPlaceholder?: string;
}

export interface HowItWorksShopsContent {
    title: string;
    intro: string;
    features: AdminFeature[];
}

export interface SettingsContent {
    title: string;
    intro: string;
    sections: {
        title: string;
        description: string;
    }[];
}

export interface ComparisonRow {
    platform: string;
    monthlyCost: string;
    commissionFees: string;
    setupTime: string;
    focus: string;
    isHighlighted?: boolean;
}

export interface ComparisonContent {
    title: string;
    intro: string;
    table: ComparisonRow[];
    problemsTitle: string;
    problems: {
        title: string;
        description: string;
    }[];
    image?: string;
}

export interface WhyFreeContent {
    title: string;
    noCatchTitle: string;
    noCatchParagraphs: string[];
    howWeMoneyTitle: string;
    howWeMoneyParagraphs: string[];
    whyNoPaymentsTitle: string;
    whyNoPaymentsBullets: string[];
    image?: string;
}

export interface SetupStep {
    title: string;
    description: string;
    duration: string;
}

export interface SetupGuideContent {
    title: string;
    intro: string;
    steps: SetupStep[];
}

export interface AvailabilityContent {
    title: string;
    intro: string;
    formula: string;
    features: {
        title: string;
        description: string;
    }[];
}

export interface NicheContent {
    title: string;
    intro: string;
    sections: {
        title: string;
        bullets: string[];
    }[];
    image?: string;
}

export interface LocationsContent {
    title: string;
    intro: string;
    currentLocations: string[];
    localSeoTitle: string;
    localSeoParagraph: string;
    localSeoBullets: string[];
    joinCta: string;
    image?: string;
}

export interface FAQItem {
    question: string;
    answer: string;
    category: "riders" | "shops";
}

export interface FAQContent {
    title: string;
    items: FAQItem[];
}

export interface CTAContent {
    title: string;
    riderTitle: string;
    riderDescription: string;
    riderCta: string;
    shopTitle: string;
    shopDescription: string;
    shopCta: string;
    image?: string;
}

export interface AboutPageContent {
    hero: HeroContent;
    whatIs: WhatIsContent;
    howItWorksRiders: HowItWorksRidersContent;
    confirmationFlow: ConfirmationFlowContent;
    howItWorksShops: HowItWorksShopsContent;
    settings: SettingsContent;
    comparison: ComparisonContent;
    whyFree: WhyFreeContent;
    setupGuide: SetupGuideContent;
    availability: AvailabilityContent;
    niche: NicheContent;
    locations: LocationsContent;
    faq: FAQContent;
    cta: CTAContent;
}

// ============================================================================
// DEFAULT CONTENT
// ============================================================================

export const DEFAULT_ABOUT_CONTENT: AboutPageContent = {
    hero: {
        title: "The Free Mountain Bike Rental Booking System",
        subtitle: "Built for bike shops. Not everything-shops.",
        description: "Start taking online bookings in 5 minutes. No monthly fees. No commission. No payment processing headaches. Just a simple, beautiful booking system designed specifically for MTB and e-bike rentals.",
        ctaRider: "Find a Bike",
        ctaShop: "Join as Partner",
        heroImage: "/images/about/mtb-reserve-bike-renting-system-1.jpeg",
    },
    whatIs: {
        title: "What is MTB Reserve? The Simplest Bike Rental Software",
        paragraphs: [
            "MTB Reserve is a free online booking platform built specifically for mountain bike rentals, e-bike rentals, and trail bike hire services. Unlike generic rental software that tries to do everything—from kayaks to escape rooms—MTB Reserve focuses exclusively on what matters to bike shops: managing your fleet, taking bookings, and getting riders on trails.",
            "Whether you run a small mountain bike rental shop in the Alps, manage a fleet of e-bikes at a tourist destination, or operate trail-side rentals at a bike park, MTB Reserve gives you the tools to accept online reservations 24/7 without the complexity, cost, or commission fees of traditional rental software."
        ],
        whyBuiltTitle: "Why We Built MTB Reserve",
        whyBuiltParagraph: "We noticed a problem in the bike rental industry: existing booking platforms were either too expensive (charging monthly fees plus commissions on every booking) or too complicated (designed for multi-purpose rental businesses with features bike shops don't need). MTB Reserve was created with one goal: make it ridiculously easy for bike rental shops to accept online bookings—for free.",
        whoUsesTitle: "Who Uses MTB Reserve?",
        whoUsesList: [
            "Mountain bike rental shops looking for a simple online booking system",
            "E-bike rental businesses at tourist destinations",
            "Trail centers and bike parks offering equipment hire",
            "Hotels and resorts with bike rental services for guests",
            "Tour operators managing guided MTB experiences",
            "Small bike shops that want to offer rentals alongside sales"
        ],
        image: "/images/about/mtb-reserve-bike-renting-system-2.jpeg",
    },
    howItWorksRiders: {
        title: "How to Book a Mountain Bike Online with MTB Reserve",
        intro: "Renting a mountain bike or e-bike through MTB Reserve takes just 4 simple steps. No account creation required. No payment upfront. Just pick your bike and show up ready to ride.",
        steps: [
            {
                title: "Choose Your Date",
                description: "Select when you want to ride using our intuitive calendar. Blocked dates (holidays, maintenance days) are automatically hidden so you only see available days.",
            },
            {
                title: "Pick Your Time Slot",
                description: "Choose from available time slots—morning, afternoon, or full day. Real-time availability shows exactly how many bikes are left for each slot, so you never arrive to find your bike already booked.",
            },
            {
                title: "Select Your Bike",
                description: "Browse available bike types—from hardtails to full-suspension MTBs to e-bikes. Each listing shows real-time stock availability, hourly rental pricing, and bike specifications. Select your bike type and quantity (perfect for groups!).",
            },
            {
                title: "Enter Your Details & Confirm",
                description: "Fill in your name, email, and phone number. That's it. You'll receive a confirmation email with a magic link—click it to confirm your booking and receive your unique booking code for pickup. No payment required online. You pay when you arrive at the shop—cash or card, your choice.",
            },
        ],
    },
    confirmationFlow: {
        title: "Secure Bike Rental Reservations with Email Verification",
        intro: "We take booking seriously. To prevent no-shows and ensure every reservation is genuine, MTB Reserve uses a double opt-in confirmation system:",
        steps: [
            "You submit your booking request → System holds bikes for 30 minutes",
            "You receive a confirmation email → Click the magic link",
            "Your booking is confirmed → You receive a unique booking code",
            "Show up and ride → Present your code at pickup"
        ],
        bookingCodeDescription: "Every confirmed reservation includes a unique alphanumeric booking code (e.g., MTB-A7X3K2). This code is your ticket to your bike—just show it at the rental shop when you arrive.",
    },
    howItWorksShops: {
        title: "MTB Rental Management Software for Bike Shops",
        intro: "Running a bike rental business shouldn't require an IT degree. MTB Reserve gives shop owners a powerful yet simple admin dashboard to manage everything from inventory to bookings to customer communications.",
        features: [
            {
                title: "The Admin Dashboard",
                description: "Your command center for bike rental operations. At a glance, see:",
                bullets: [
                    "Today's guests – How many riders are coming in today",
                    "Pending confirmations – Bookings waiting for customer email verification",
                    "Total bookings – Your complete reservation history",
                    "Quick actions – Confirm, cancel, or modify bookings with one click"
                ],
            },
            {
                title: "Calendar View for Bike Reservations",
                description: "See all your bookings laid out on a visual calendar. Click any date to view that day's reservations—including customer details, bike types, time slots, and booking status. Perfect for morning prep, staff scheduling, and availability planning.",
            },
            {
                title: "Bike Fleet & Inventory Management",
                description: "Manage your entire bike fleet from one screen:",
                bullets: [
                    "Add bike types – MTB, e-bike, hardtail, full-suspension, kids bikes, etc.",
                    "Set stock levels – Total bikes in inventory",
                    "Track broken/maintenance bikes – Automatically excluded from availability",
                    "Set hourly pricing – Display rental rates to customers"
                ],
            },
        ],
    },
    settings: {
        title: "Customizable Booking System for MTB Rentals",
        intro: "Every bike rental business is different. MTB Reserve gives you the flexibility to configure the booking experience exactly how you want it.",
        sections: [
            {
                title: "Custom Time Slots",
                description: "Create booking slots that match your business hours: morning, afternoon, or full day. The system even detects overlapping time slots and warns you before saving."
            },
            {
                title: "Blocked Dates & Holidays",
                description: "Close specific dates for seasonal closures, holidays, maintenance days, or special events. Set dates as yearly recurring for annual holidays—configure once, apply forever."
            },
            {
                title: "Advance Booking Rules",
                description: "Control when customers can book with minimum and maximum days in advance settings. Perfect for managing seasonal demand and staff planning."
            },
            {
                title: "Content Customization",
                description: "Personalize your booking page with custom titles, info box messages, and pickup location with Google Maps integration."
            },
        ],
    },
    comparison: {
        title: "MTB Reserve vs. Other Bike Rental Software: The Honest Comparison",
        intro: "Let's be real: there are other booking platforms out there. Checkfront, FareHarbor, Peek, Bokun—they're all fine products. But they weren't built for you.",
        table: [
            { platform: "Checkfront", monthlyCost: "$49-$299/mo", commissionFees: "0-3%", setupTime: "Days-Weeks", focus: "Everything" },
            { platform: "FareHarbor", monthlyCost: "\"Free\"", commissionFees: "6% per booking", setupTime: "Hours-Days", focus: "Tours & Activities" },
            { platform: "Peek", monthlyCost: "\"Free\"", commissionFees: "6% per booking", setupTime: "Hours-Days", focus: "Tours & Activities" },
            { platform: "Bokun", monthlyCost: "$49-$349/mo", commissionFees: "1.5-3%", setupTime: "Days", focus: "Tours & Activities" },
            { platform: "MTB Reserve", monthlyCost: "Free", commissionFees: "0%", setupTime: "5 minutes", focus: "MTB & Bikes", isHighlighted: true },
        ],
        problemsTitle: "Why Generic Platforms Fall Short for Bike Rentals",
        problems: [
            {
                title: "They're designed for tour operators, not bike shops",
                description: "Generic platforms were built for kayak tours, escape rooms, wine tastings, and guided experiences. Bike rentals are an afterthought."
            },
            {
                title: "Complex setup that wastes your time",
                description: "Multi-purpose platforms require extensive configuration—inventory systems, pricing rules, booking flows, integrations, staff training. For a small bike shop, this is overkill."
            },
            {
                title: "Monthly fees eat into your profits",
                description: "$49/month might seem reasonable—until you calculate that you could rent 2-3 extra bikes per month just to cover software costs."
            },
            {
                title: "Commission fees add up fast",
                description: "6% per booking? On a €50 rental, that's €3 gone. Rent 20 bikes a day during peak season? That's €60/day—€1,800/month—going to the platform."
            },
            {
                title: "Forced online payments create friction",
                description: "Most platforms require payment gateway setup, transaction fees, chargeback risks, and refund processing. With MTB Reserve, customers pay at pickup. Simple."
            },
        ],
        image: "/images/about/mtb-reserve-bike-renting-system-3.jpeg",
    },
    whyFree: {
        title: "Why is MTB Reserve Free? (And What's the Catch?)",
        noCatchTitle: "There is No Catch",
        noCatchParagraphs: [
            "MTB Reserve is genuinely free for bike rental shops. No trial periods. No feature limits. No \"free tier\" that forces you to upgrade.",
            "You sign up, add your bikes, configure settings, and start receiving bookings. You keep 100% of your rental revenue."
        ],
        howWeMoneyTitle: "How We Make Money (Eventually)",
        howWeMoneyParagraphs: [
            "Right now, we're focused on building the best bike rental booking system possible. In the future, we may introduce optional premium features for larger operations—things like advanced analytics, API integrations, multi-location management, and white-label branding removal.",
            "But the core booking system will always be free for bike shops."
        ],
        whyNoPaymentsTitle: "Why No Online Payments?",
        whyNoPaymentsBullets: [
            "Zero transaction fees – You keep 100% of the rental price",
            "No chargebacks – Cash and in-person card payments don't have chargeback risks",
            "Simpler for customers – No credit card required to book",
            "Reduces friction – More bookings, fewer abandoned carts",
            "Your relationship, your rules – Handle payments your way"
        ],
        image: "/images/about/mtb-reserve-bike-renting-system-4.jpeg",
    },
    setupGuide: {
        title: "Set Up Your Bike Rental Booking System in 5 Minutes",
        intro: "Getting started with MTB Reserve is ridiculously simple. No technical knowledge required. No integrations to configure.",
        steps: [
            {
                title: "Request Access",
                description: "Click \"I want to join\" on our homepage. Fill in your shop name, contact details, and fleet size. We'll review your application and set up your account—usually within 24 hours.",
                duration: "30 seconds",
            },
            {
                title: "Add Your Bikes",
                description: "Log into your admin dashboard and navigate to Inventory. Add your bike types with name, stock quantity, and hourly price. Repeat for each bike type in your fleet.",
                duration: "2 minutes",
            },
            {
                title: "Configure Your Settings",
                description: "Go to Settings and customize your time slots, contact info, and info messages for any important rental policies.",
                duration: "2 minutes",
            },
            {
                title: "Share Your Booking Link",
                description: "Your booking page is live. Share this link on your website, Google Maps, social media, and email signature. That's it—you're ready to receive online bike bookings.",
                duration: "30 seconds",
            },
        ],
    },
    availability: {
        title: "No More Double-Booking: Smart Availability for Bike Rentals",
        intro: "The #1 complaint we hear from bike shop owners about manual booking systems: double bookings. You've been there: A customer shows up expecting a bike, but it's already rented to someone else because your spreadsheet wasn't updated. MTB Reserve eliminates this problem with real-time availability calculation.",
        formula: "Available Bikes = Total Stock − Active Bookings − Broken/Maintenance",
        features: [
            {
                title: "Automatic Calculation",
                description: "For every time slot, the system automatically calculates how many bikes are actually available. Customers only see slots with available inventory—preventing overbooking before it happens."
            },
            {
                title: "Slot-Based Booking",
                description: "Because bookings are organized by time slots, the system knows exactly which bikes are available during each period. A morning rental doesn't block an afternoon reservation for the same bike."
            },
            {
                title: "Maintenance Mode",
                description: "Got a bike in the shop for repairs? Mark it as \"broken\" in your inventory. It's automatically removed from availability until you fix it. No manual calendar blocking required."
            },
        ],
    },
    niche: {
        title: "Specialized Booking Software for Mountain Bike and E-Bike Rentals",
        intro: "MTB Reserve wasn't built as generic rental software. It was built by mountain biking enthusiasts for mountain bike rental businesses.",
        sections: [
            {
                title: "Designed for the MTB Rental Industry",
                bullets: [
                    "Hourly pricing – Perfect for half-day and full-day rentals",
                    "Quantity booking – Groups can reserve multiple bikes at once",
                    "Bike type categorization – Separate inventory for MTBs, e-bikes, kids bikes",
                    "Time slots – Match common rental patterns (morning/afternoon/full day)"
                ]
            },
            {
                title: "Perfect for E-Bike Rentals",
                bullets: [
                    "Track e-bike inventory separately from traditional MTBs",
                    "Set different pricing for e-bikes vs. regular bikes",
                    "Manage battery availability through maintenance tracking"
                ]
            },
            {
                title: "Great for Trail Centers & Bike Parks",
                bullets: [
                    "Seasonal date blocking for off-season closures",
                    "Multiple bike types for different trail difficulties",
                    "Volume capacity for busy peak days"
                ]
            },
        ],
        image: "/images/about/mtb-reserve-bike-renting-system-5.jpeg",
    },
    locations: {
        title: "MTB Reserve Bike Rental Locations",
        intro: "MTB Reserve is growing across Europe, with partner shops in scenic mountain biking destinations.",
        currentLocations: [
            "Sillico – Garfagnana, Tuscany, Italy",
            "Castelnuovo di Garfagnana – Tuscany, Italy"
        ],
        localSeoTitle: "Rent Mountain Bikes in Italy",
        localSeoParagraph: "Looking to rent a mountain bike in Tuscany? Our partner shops in the Garfagnana region offer:",
        localSeoBullets: [
            "High-quality full-suspension MTBs",
            "Premium e-bikes for tackling climbs",
            "Trail recommendations and local expertise",
            "Easy online booking with no upfront payment"
        ],
        joinCta: "We're expanding to new locations across Europe. If you run a bike rental shop and want to offer online booking for free, join MTB Reserve today.",
        image: "/images/about/mtb-reserve-bike-renting-system-6.jpeg",
    },
    faq: {
        title: "FAQs: Mountain Bike Rental Booking with MTB Reserve",
        items: [
            {
                question: "Do I need to pay online to book a bike?",
                answer: "No. MTB Reserve uses a pay-at-pickup model. You book online for free, then pay when you collect your bike—cash or card.",
                category: "riders"
            },
            {
                question: "How do I confirm my booking?",
                answer: "After submitting your booking request, you'll receive an email with a confirmation link. Click it within 30 minutes to confirm. You'll then receive your booking code.",
                category: "riders"
            },
            {
                question: "What if I need to cancel?",
                answer: "Contact the rental shop directly using the contact details on your confirmation email. Cancellation policies vary by shop.",
                category: "riders"
            },
            {
                question: "Can I book multiple bikes for my group?",
                answer: "Yes! During booking, you can select the quantity of bikes you need (subject to availability).",
                category: "riders"
            },
            {
                question: "Is MTB Reserve really free?",
                answer: "Yes. No monthly fees, no commissions, no hidden costs. The core booking system is 100% free.",
                category: "shops"
            },
            {
                question: "How do I get paid?",
                answer: "Customers pay you directly at pickup. MTB Reserve never handles your money—you keep every euro of your rental revenue.",
                category: "shops"
            },
            {
                question: "Can I customize my booking page?",
                answer: "Yes. You can add custom titles, info messages, and your Google Maps pickup location.",
                category: "shops"
            },
            {
                question: "What if a bike is broken?",
                answer: "Mark it as \"broken\" in your inventory. It's automatically removed from availability until you fix it.",
                category: "shops"
            },
            {
                question: "How do I block holidays or off-season dates?",
                answer: "Use the Blocked Dates feature in Settings. You can set single dates or date ranges, with the option for yearly recurrence.",
                category: "shops"
            },
        ],
    },
    cta: {
        title: "Start Using MTB Reserve Today",
        riderTitle: "For Riders",
        riderDescription: "Find a bike near you. Enter your destination and discover local bike rental shops with online availability.",
        riderCta: "Find Bikes",
        shopTitle: "For Bike Shops",
        shopDescription: "Join the network—free. Get your shop online in 5 minutes. No fees, no commissions, no hassle.",
        shopCta: "I Want to Join",
        image: "/images/about/mtb-reserve-bike-renting-system-1.jpeg",
    },
};

// ============================================================================
// DATA ACCESS FUNCTIONS
// ============================================================================

export async function getAboutContent(): Promise<AboutPageContent> {
    try {
        const record = await db.aboutPageContent.findUnique({
            where: { id: "about" }
        });

        if (!record || !record.content) {
            return DEFAULT_ABOUT_CONTENT;
        }

        // Merge with defaults to ensure all fields exist
        const stored = record.content as Partial<AboutPageContent>;
        return {
            ...DEFAULT_ABOUT_CONTENT,
            ...stored,
        };
    } catch (e) {
        console.error("Failed to fetch about page content:", e);
        return DEFAULT_ABOUT_CONTENT;
    }
}

export async function saveAboutContent(content: AboutPageContent): Promise<void> {
    await db.aboutPageContent.upsert({
        where: { id: "about" },
        create: {
            id: "about",
            content: content as any,
        },
        update: {
            content: content as any,
        },
    });
}

export async function triggerRebuild(): Promise<{ success: boolean; error?: string }> {
    const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;

    if (!hookUrl) {
        console.warn("VERCEL_DEPLOY_HOOK_URL not configured, skipping rebuild trigger");
        return { success: true }; // Don't fail if not configured
    }

    try {
        const response = await fetch(hookUrl, { method: "POST" });

        if (!response.ok) {
            return { success: false, error: `Vercel hook returned ${response.status}` };
        }

        return { success: true };
    } catch (e) {
        console.error("Failed to trigger rebuild:", e);
        return { success: false, error: "Failed to trigger rebuild" };
    }
}
