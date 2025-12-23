import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@client/components/ui/toaster";
import { Footer } from "@client/components/layout/Footer";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillForged | AI-Powered Learning Roadmaps",
  description:
    "Generate personalized, AI-powered learning roadmaps tailored to your goals, skill level, and schedule. Master any skill with structured, week-by-week curriculums.",
  keywords: [
    "learning roadmap",
    "AI education",
    "skill development",
    "personalized learning",
    "curriculum generator",
  ],
  openGraph: {
    title: "SkillForged | AI-Powered Learning Roadmaps",
    description:
      "Generate personalized learning roadmaps powered by AI. Tell us what you want to learn and get a structured curriculum.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-black text-white min-h-screen flex flex-col`}>
        <Providers>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}

