import { FAQContent } from "@/lib/about-content";
import { HelpCircle, Bike, Store } from "lucide-react";

interface FAQSectionProps {
    content: FAQContent;
}

export default function FAQSection({ content }: FAQSectionProps) {
    const riderFaqs = content.items.filter((item) => item.category === "riders");
    const shopFaqs = content.items.filter((item) => item.category === "shops");

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-gray-100 rounded-xl">
                            <HelpCircle className="w-6 h-6 text-gray-700" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            {content.title}
                        </h2>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Riders FAQs */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Bike className="w-5 h-5 text-orange-700" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">For Riders</h3>
                        </div>
                        <div className="space-y-4">
                            {riderFaqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                                >
                                    <h4 className="font-bold text-gray-900 mb-2">{faq.question}</h4>
                                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shops FAQs */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Store className="w-5 h-5 text-blue-700" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">For Bike Shops</h3>
                        </div>
                        <div className="space-y-4">
                            {shopFaqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                                >
                                    <h4 className="font-bold text-gray-900 mb-2">{faq.question}</h4>
                                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
