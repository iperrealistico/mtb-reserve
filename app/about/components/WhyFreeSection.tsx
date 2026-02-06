import { WhyFreeContent } from "@/lib/about-content";
import { Gift, CheckCircle2 } from "lucide-react";
import PhotoPlaceholder from "./PhotoPlaceholder";

interface WhyFreeSectionProps {
    content: WhyFreeContent;
}

export default function WhyFreeSection({ content }: WhyFreeSectionProps) {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Left Column */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-green-100 rounded-2xl">
                                <Gift className="w-8 h-8 text-green-700" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                                {content.title}
                            </h2>
                        </div>

                        {/* No Catch */}
                        <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                            <h3 className="text-xl font-bold text-green-900 mb-4">
                                {content.noCatchTitle}
                            </h3>
                            {content.noCatchParagraphs.map((para, index) => (
                                <p key={index} className="text-green-800 leading-relaxed mb-3 last:mb-0">
                                    {para}
                                </p>
                            ))}
                        </div>

                        {/* How We Make Money */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {content.howWeMoneyTitle}
                            </h3>
                            {content.howWeMoneyParagraphs.map((para, index) => (
                                <p key={index} className="text-gray-600 leading-relaxed mb-3 last:mb-0">
                                    {para}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Image */}
                        {content.image ? (
                            <img
                                src={content.image}
                                alt="High-end mountain bike"
                                className="rounded-2xl shadow-lg w-full"
                            />
                        ) : (
                            <PhotoPlaceholder
                                label="Aesthetic cycling photo: Close-up of high-end MTB with scenic background"
                                aspectRatio="video"
                            />
                        )}

                        {/* Why No Payments */}
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {content.whyNoPaymentsTitle}
                            </h3>
                            <ul className="space-y-3">
                                {content.whyNoPaymentsBullets.map((bullet, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-600">{bullet}</span>
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
