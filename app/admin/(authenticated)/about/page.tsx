import { getAboutContent } from "@/lib/about-content";
import AboutForm from "./about-form";

export default async function AboutPageAdmin() {
    const content = await getAboutContent();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">About Page</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Edit the content for the /about SEO landing page. Changes will trigger a site rebuild.
                </p>
            </div>

            <AboutForm initialContent={content} />
        </div>
    );
}
