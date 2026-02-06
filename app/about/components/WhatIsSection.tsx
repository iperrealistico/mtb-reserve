import { WhatIsContent } from "@/lib/about-content";
import { CheckCircle2 } from "lucide-react";
import PhotoPlaceholder from "./PhotoPlaceholder";

interface WhatIsSectionProps {
    content: WhatIsContent;
}

export default function WhatIsSection({ content }: WhatIsSectionProps) {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                {/* Main Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                    {content.title}
                </h2>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Left Column - Main Content */}
                    <div className="space-y-6">
                        {content.paragraphs.map((paragraph, index) => (
                            <p key={index} className="text-lg text-gray-600 leading-relaxed">
                                {paragraph}
                            </p>
                        ))}

                        {/* Why We Built */}
                        <div className="pt-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {content.whyBuiltTitle}
                            </h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {content.whyBuiltParagraph}
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Image + Who Uses */}
                    <div className="space-y-8">
                        {content.image ? (
                            <img
                                src={content.image}
                                alt="Mountain biking scenic view"
                                className="rounded-2xl shadow-lg w-full"
                            />
                        ) : (
                            <PhotoPlaceholder
                                label="Aesthetic cycling photo: Mountain biker on scenic trail at golden hour"
                                aspectRatio="video"
                            />
                        )}

                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {content.whoUsesTitle}
                            </h3>
                            <ul className="space-y-3">
                                {content.whoUsesList.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-600">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
