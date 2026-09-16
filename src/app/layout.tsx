import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Manrope, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nitesh Kuamr — Video Editor & Motion Graphic Designer",
  description:
    "Portfolio of Nitesh Kuamr, a video editor and motion graphic designer from Delhi, India. Long-form storytelling, short-form content, motion graphics and creative editing.",
  keywords: [
    "video editor",
    "motion graphic designer",
    "Nitesh Kuamr",
    "premiere pro",
    "after effects",
    "Delhi",
  ],
  authors: [{ name: "Nitesh Kuamr" }],
  openGraph: {
    title: "Nitesh Kuamr — Video Editor & Motion Graphic Designer",
    description:
      "I turn raw footage into visual stories that people remember. Editing, motion graphics and cinematic storytelling.",
    type: "website",
    images: [{ url: "/images/portrait.webp", alt: "Nitesh Kuamr — portrait" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#08090d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${cormorant.variable}`}>
      <body className="grain bg-ink text-cream antialiased">
        <div className="vignette" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
