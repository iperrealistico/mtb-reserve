import Link from "next/link";
import { ArrowRight, Bike, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroContent } from "@/lib/about-content";
import PhotoPlaceholder from "./PhotoPlaceholder";

interface HeroSectionProps {
    content: HeroContent;
}

export default function HeroSection({ content }: HeroSectionProps) {
    return (
        <section className="relative min-h-[80vh] flex items-center py-20 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

            <div className="relative max-w-6xl mx-auto px-6 w-full">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Text Content */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
                                {content.title}
                            </h1>
                            <p className="text-xl md:text-2xl font-medium text-gray-600">
                                {content.subtitle}
                            </p>
                        </div>

                        <p className="text-lg text-gray-500 leading-relaxed max-w-xl">
                            {content.description}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button asChild size="lg" className="h-14 px-8 text-lg font-semibold rounded-xl">
                                <Link href="/">
                                    <Bike className="w-5 h-5 mr-2" />
                                    {content.ctaRider}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-medium rounded-xl border-2">
                                <Link href="/">
                                    <Store className="w-5 h-5 mr-2" />
                                    {content.ctaShop}
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="hidden lg:block">
                        {content.heroImage ? (
                            <img
                                src={content.heroImage}
                                alt="MTB Reserve booking interface"
                                className="rounded-2xl shadow-2xl"
                            />
                        ) : (
                            <PhotoPlaceholder
                                label="Hero image: Rider on mountain trail + booking interface"
                                aspectRatio="square"
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
