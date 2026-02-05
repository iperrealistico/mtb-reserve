import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { getSiteSettings } from "@/lib/site-settings";
import GlobalClickListener from "@/components/GlobalClickListener";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mtbreserve.com";

  return {
    title: settings.serpTitle || "MTB Reserve",
    description: settings.serpDescription || "MTB Booking System",
    keywords: settings.seoKeywords?.join(", "),
    icons: {
      icon: settings.faviconUrl || "/favicon.ico",
      apple: settings.faviconUrl || "/favicon.ico",
    },
    openGraph: {
      title: settings.serpTitle || "MTB Reserve",
      description: settings.serpDescription || "MTB Booking System",
      images: settings.socialImageUrl ? [{ url: `${baseUrl}${settings.socialImageUrl}` }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.serpTitle || "MTB Reserve",
      description: settings.serpDescription || "MTB Booking System",
      images: settings.socialImageUrl ? [`${baseUrl}${settings.socialImageUrl}`] : [],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
        <GlobalClickListener />
      </body>
    </html>
  );
}
