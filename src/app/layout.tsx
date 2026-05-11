import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // Optimize font loading for performance
});

export const metadata: Metadata = {
  title: {
    default: "AI Spend Audit — Stop Overpaying for AI Tools",
    template: "%s | AI Spend Audit",
  },
  description:
    "Audit your AI tool stack and discover hidden savings instantly. Free rule-based analysis for ChatGPT, Claude, Cursor, GitHub Copilot, Gemini, and more.",
  keywords: [
    "AI tool audit",
    "AI spend optimization",
    "ChatGPT cost",
    "Claude pricing",
    "Cursor optimization",
    "startup AI tools",
  ],
  authors: [{ name: "AI Spend Audit" }],
  openGraph: {
    title: "AI Spend Audit — Stop Overpaying for AI Tools",
    description:
      "Audit your AI stack and discover hidden savings instantly.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Spend Audit",
    description: "Stop overpaying for AI tools. Free instant audit.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#0a0a0f] font-sans antialiased flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
