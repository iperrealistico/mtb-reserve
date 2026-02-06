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

  return {
    title: settings.serpTitle || "MTB Reserve",
    description: settings.serpDescription || "MTB Booking System",
    keywords: settings.seoKeywords?.join(", "),
    icons: {
      icon: [
        { url: settings.favicon16Url || settings.faviconUrl || "/favicon.ico", sizes: "16x16", type: "image/png" },
        { url: settings.favicon32Url || settings.faviconUrl || "/favicon.ico", sizes: "32x32", type: "image/png" },
        { url: settings.faviconUrl || "/favicon.ico", sizes: "192x192", type: "image/png" },
      ],
      apple: [
        { url: settings.faviconAppleUrl || settings.faviconUrl || "/favicon.ico", sizes: "180x180", type: "image/png" },
      ],
      shortcut: settings.faviconUrl || "/favicon.ico",
    },
    openGraph: {
      title: settings.serpTitle || "MTB Reserve",
      description: settings.serpDescription || "MTB Booking System",
      images: settings.socialImageUrl ? [{ url: settings.socialImageUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.serpTitle || "MTB Reserve",
      description: settings.serpDescription || "MTB Booking System",
      images: settings.socialImageUrl ? [settings.socialImageUrl] : [],
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
