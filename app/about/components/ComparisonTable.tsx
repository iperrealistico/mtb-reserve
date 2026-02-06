import { ComparisonContent } from "@/lib/about-content";
import { AlertTriangle, X } from "lucide-react";
import PhotoPlaceholder from "./PhotoPlaceholder";

interface ComparisonTableProps {
    content: ComparisonContent;
}

export default function ComparisonTable({ content }: ComparisonTableProps) {
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {content.title}
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {content.intro}
                    </p>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto mb-16">
                    <table className="w-full bg-white rounded-2xl shadow-sm overflow-hidden">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="text-left px-6 py-4 font-bold text-gray-900">Platform</th>
                                <th className="text-left px-6 py-4 font-bold text-gray-900">Monthly Cost</th>
                                <th className="text-left px-6 py-4 font-bold text-gray-900">Commission</th>
                                <th className="text-left px-6 py-4 font-bold text-gray-900">Setup Time</th>
                                <th className="text-left px-6 py-4 font-bold text-gray-900">Focus</th>
                            </tr>
                        </thead>
                        <tbody>
                            {content.table.map((row, index) => (
                                <tr
                                    key={index}
                                    className={`border-t border-gray-100 ${row.isHighlighted
                                        ? "bg-green-50 font-semibold"
                                        : "hover:bg-gray-50"
                                        }`}
                                >
                                    <td className={`px-6 py-4 ${row.isHighlighted ? "text-green-800" : "text-gray-900"}`}>
                                        {row.platform}
                                    </td>
                                    <td className={`px-6 py-4 ${row.isHighlighted ? "text-green-700" : "text-gray-600"}`}>
                                        {row.monthlyCost}
                                    </td>
                                    <td className={`px-6 py-4 ${row.isHighlighted ? "text-green-700" : "text-gray-600"}`}>
                                        {row.commissionFees}
                                    </td>
                                    <td className={`px-6 py-4 ${row.isHighlighted ? "text-green-700" : "text-gray-600"}`}>
                                        {row.setupTime}
                                    </td>
                                    <td className={`px-6 py-4 ${row.isHighlighted ? "text-green-700" : "text-gray-600"}`}>
                                        {row.focus}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Image */}
                <div className="mb-16">
                    {content.image ? (
                        <img
                            src={content.image}
                            alt="Group of riders with e-bikes"
                            className="rounded-2xl shadow-lg w-full"
                        />
                    ) : (
                        <PhotoPlaceholder
                            label="Aesthetic cycling photo: Group of riders with e-bikes in front of mountain scenery"
                            aspectRatio="wide"
                        />
                    )}
                </div>

                {/* Problems Section */}
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                        {content.problemsTitle}
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {content.problems.map((problem, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <X className="w-4 h-4 text-red-600" />
                                    </div>
                                    <h4 className="font-bold text-gray-900">{problem.title}</h4>
                                </div>
                                <p className="text-gray-600 text-sm">{problem.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
