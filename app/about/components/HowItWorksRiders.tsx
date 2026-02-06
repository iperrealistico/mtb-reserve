import { HowItWorksRidersContent, ConfirmationFlowContent } from "@/lib/about-content";
import { Calendar, Clock, Bike, User, Mail, Shield } from "lucide-react";
import PhotoPlaceholder from "./PhotoPlaceholder";

interface HowItWorksRidersProps {
    content: HowItWorksRidersContent;
    confirmationContent: ConfirmationFlowContent;
}

const stepIcons = [Calendar, Clock, Bike, User];

export default function HowItWorksRiders({ content, confirmationContent }: HowItWorksRidersProps) {
    return (
        <section className="py-20 bg-gray-50">
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

                {/* Steps */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {content.steps.map((step, index) => {
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="flex items-center justify-center w-12 h-12 bg-gray-900 text-white rounded-full font-bold text-lg flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <div className="pt-2">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {step.title}
                                        </h3>
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed pl-16">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Main UI Image for Riders */}
                {content.image && (
                    <div className="mb-20">
                        <img
                            src={content.image}
                            alt="MTB Reserve Rider Booking Interface"
                            className="rounded-2xl shadow-xl w-full border border-gray-200"
                        />
                    </div>
                )}

                {/* Confirmation Flow */}
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <Shield className="w-6 h-6 text-green-700" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {confirmationContent.title}
                                </h3>
                            </div>

                            <p className="text-lg text-gray-600 mb-8">
                                {confirmationContent.intro}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {confirmationContent.steps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm mb-3">
                                            {index + 1}
                                        </div>
                                        <p className="text-xs text-gray-600">{step}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-50 rounded-xl p-6 flex items-start gap-4">
                                <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">Your Booking Code</h4>
                                    <p className="text-gray-600 text-sm">
                                        {confirmationContent.bookingCodeDescription}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Confirmation Image */}
                        <div>
                            {confirmationContent.image ? (
                                <img
                                    src={confirmationContent.image}
                                    alt="MTB Reserve Confirmation Flow"
                                    className="rounded-2xl shadow-lg w-full border border-gray-100"
                                />
                            ) : (
                                <PhotoPlaceholder
                                    label="Screenshot: Confirmation success screen"
                                    aspectRatio="video"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
