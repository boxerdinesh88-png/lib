import { Inter, Space_Grotesk } from "next/font/google";

import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { Providers } from "./providers";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: {
    default: "Phahendra Babu Library — Book your study seat by the hour",
    template: "%s · Phahendra Babu Library",
  },
  description:
    "Reserve a dedicated study-library seat for any time block — 4 hours to the full day. Pick your block, choose your seat and pay once with UPI.",
  keywords: ["study library", "seat booking", "monthly pass", "UPI", "study seat"],
  openGraph: {
    title: "Phahendra Babu Library",
    description: "Book your study-library seat by the hour",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Phahendra Babu Library", statusBarStyle: "default" },
  // Mobile-specific meta tags
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    // Add your verification meta tags here when needed
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("libseat_theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");if(t==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`}
        </Script>
        {/* Mobile-specific meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Phahendra Babu Library" />
        <meta name="application-name" content="Phahendra Babu Library" />
        <meta name="msapplication-TileColor" content="#2563EB" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        <Providers>{children}</Providers>
        <ScrollToTop />
      </body>
    </html>
  );
}
