import { NicheContent, LocationsContent } from "@/lib/about-content";
import { Target, MapPin, CheckCircle2 } from "lucide-react";
import PhotoPlaceholder from "./PhotoPlaceholder";

interface NicheAndLocationsSectionProps {
    nicheContent: NicheContent;
    locationsContent: LocationsContent;
}

export default function NicheAndLocationsSection({ nicheContent, locationsContent }: NicheAndLocationsSectionProps) {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                {/* Niche Section */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="p-3 bg-gray-100 rounded-xl">
                                <Target className="w-6 h-6 text-gray-700" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                                {nicheContent.title}
                            </h2>
                        </div>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {nicheContent.intro}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {nicheContent.sections.map((section, index) => (
                            <div key={index} className="bg-gray-50 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    {section.title}
                                </h3>
                                <ul className="space-y-2">
                                    {section.bullets.map((bullet, bi) => (
                                        <li key={bi} className="flex items-start gap-2 text-sm text-gray-600">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span>{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Niche Image */}
                    <div className="mt-12">
                        {nicheContent.image ? (
                            <img
                                src={nicheContent.image}
                                alt="E-bike riders on alpine trail"
                                className="rounded-2xl shadow-lg w-full"
                            />
                        ) : (
                            <PhotoPlaceholder
                                label="Aesthetic cycling photo: E-bike riders on alpine trail"
                                aspectRatio="wide"
                            />
                        )}
                    </div>
                </div>

                {/* Locations Section */}
                <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <MapPin className="w-6 h-6 text-blue-700" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {locationsContent.title}
                        </h2>
                    </div>

                    <p className="text-lg text-gray-600 mb-8">
                        {locationsContent.intro}
                    </p>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Current Locations */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Currently Serving</h3>
                            <ul className="space-y-2 mb-8">
                                {locationsContent.currentLocations.map((location, index) => (
                                    <li key={index} className="flex items-center gap-3 text-gray-600">
                                        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <span>{location}</span>
                                    </li>
                                ))}
                            </ul>

                            <h4 className="font-bold text-gray-900 mb-3">
                                {locationsContent.localSeoTitle}
                            </h4>
                            <p className="text-gray-600 mb-4">
                                {locationsContent.localSeoParagraph}
                            </p>
                            <ul className="space-y-2">
                                {locationsContent.localSeoBullets.map((bullet, index) => (
                                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Image */}
                        <div>
                            {locationsContent.image ? (
                                <img
                                    src={locationsContent.image}
                                    alt="Riders in Tuscan countryside"
                                    className="rounded-2xl shadow-lg w-full h-full object-cover"
                                />
                            ) : (
                                <PhotoPlaceholder
                                    label="Aesthetic cycling photo: Riders in Tuscan countryside/Garfagnana mountains"
                                    aspectRatio="square"
                                />
                            )}
                        </div>
                    </div>

                    <p className="mt-8 text-gray-600 bg-white rounded-xl p-4 border border-gray-200">
                        {locationsContent.joinCta}
                    </p>
                </div>
            </div>
        </section>
    );
}
