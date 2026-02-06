import Link from "next/link";
import { CTAContent } from "@/lib/about-content";
import { Bike, Store, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhotoPlaceholder from "./PhotoPlaceholder";

interface CTASectionProps {
    content: CTAContent;
}

export default function CTASection({ content }: CTASectionProps) {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
                    {content.title}
                </h2>

                {/* Image */}
                <div className="mb-12">
                    {content.image ? (
                        <img
                            src={content.image}
                            alt="Mountain biking action shot"
                            className="rounded-2xl shadow-lg w-full"
                        />
                    ) : (
                        <PhotoPlaceholder
                            label="Final hero image: Dramatic mountain biking action shot"
                            aspectRatio="wide"
                        />
                    )}
                </div>

                {/* CTA Cards */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Riders CTA */}
                    <div className="bg-gray-900 text-white rounded-2xl p-8 flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-white/10 rounded-xl">
                                <Bike className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold">{content.riderTitle}</h3>
                        </div>
                        <p className="text-gray-300 mb-6 flex-grow">
                            {content.riderDescription}
                        </p>
                        <Button asChild size="lg" className="w-full h-14 text-lg font-semibold rounded-xl bg-white text-gray-900 hover:bg-gray-100">
                            <Link href="/">
                                {content.riderCta}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </Button>
                    </div>

                    {/* Shops CTA */}
                    <div className="bg-blue-600 text-white rounded-2xl p-8 flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-white/10 rounded-xl">
                                <Store className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold">{content.shopTitle}</h3>
                        </div>
                        <p className="text-blue-100 mb-6 flex-grow">
                            {content.shopDescription}
                        </p>
                        <Button asChild size="lg" className="w-full h-14 text-lg font-semibold rounded-xl bg-white text-blue-600 hover:bg-blue-50">
                            <Link href="/">
                                {content.shopCta}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
