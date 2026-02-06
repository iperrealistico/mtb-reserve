import { HowItWorksShopsContent, SettingsContent } from "@/lib/about-content";
import { LayoutDashboard, CalendarDays, Package, Settings, CheckCircle2 } from "lucide-react";
import PhotoPlaceholder from "./PhotoPlaceholder";

interface HowItWorksShopsProps {
    content: HowItWorksShopsContent;
    settingsContent: SettingsContent;
}

const featureIcons = [LayoutDashboard, CalendarDays, Package];

export default function HowItWorksShops({ content, settingsContent }: HowItWorksShopsProps) {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {content.title}
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {content.intro}
                    </p>
                </div>

                {/* Features */}
                <div className="space-y-12 mb-20">
                    {content.features.map((feature, index) => {
                        const Icon = featureIcons[index] || LayoutDashboard;
                        const isEven = index % 2 === 0;

                        return (
                            <div
                                key={index}
                                className={`grid lg:grid-cols-2 gap-8 items-center ${isEven ? "" : "lg:flex-row-reverse"}`}
                            >
                                <div className={`space-y-4 ${isEven ? "" : "lg:order-2"}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-gray-100 rounded-xl">
                                            <Icon className="w-6 h-6 text-gray-700" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            {feature.title}
                                        </h3>
                                    </div>
                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                    {feature.bullets && (
                                        <ul className="space-y-2 pt-2">
                                            {feature.bullets.map((bullet, bi) => (
                                                <li key={bi} className="flex items-start gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-600">{bullet}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div className={isEven ? "" : "lg:order-1"}>
                                    <PhotoPlaceholder
                                        label={`Screenshot: ${feature.title}`}
                                        aspectRatio="video"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Settings Section */}
                <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-gray-200 rounded-xl">
                            <Settings className="w-6 h-6 text-gray-700" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {settingsContent.title}
                            </h3>
                            <p className="text-gray-600">{settingsContent.intro}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {settingsContent.sections.map((section, index) => (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                                <h4 className="font-bold text-gray-900 mb-2">{section.title}</h4>
                                <p className="text-gray-600 text-sm">{section.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
