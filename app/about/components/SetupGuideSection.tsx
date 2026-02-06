import { SetupGuideContent, AvailabilityContent } from "@/lib/about-content";
import { Rocket, Zap, Clock } from "lucide-react";
import PhotoPlaceholder from "./PhotoPlaceholder";

interface SetupGuideSectionProps {
    content: SetupGuideContent;
    availabilityContent: AvailabilityContent;
}

export default function SetupGuideSection({ content, availabilityContent }: SetupGuideSectionProps) {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-6">
                {/* Setup Guide */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-gray-900 rounded-xl">
                            <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            {content.title}
                        </h2>
                    </div>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {content.intro}
                    </p>
                </div>

                {/* Steps */}
                <div className="grid md:grid-cols-4 gap-6 mb-12">
                    {content.steps.map((step, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
                            <div className="absolute -top-3 -left-3 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                                {index + 1}
                            </div>
                            <div className="pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">{step.duration}</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Screenshot */}
                <div className="mb-20">
                    <PhotoPlaceholder
                        label="Screenshot: Complete booking wizard showing a customer making a reservation"
                        aspectRatio="video"
                    />
                </div>

                {/* Availability Section */}
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Zap className="w-6 h-6 text-blue-700" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {availabilityContent.title}
                        </h3>
                    </div>

                    <p className="text-lg text-gray-600 mb-8 max-w-3xl">
                        {availabilityContent.intro}
                    </p>

                    {/* Formula */}
                    <div className="bg-gray-900 text-white font-mono text-center py-4 px-6 rounded-xl mb-8 text-lg">
                        {availabilityContent.formula}
                    </div>

                    {/* Features */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {availabilityContent.features.map((feature, index) => (
                            <div key={index} className="bg-gray-50 rounded-xl p-6">
                                <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
                                <p className="text-gray-600 text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
