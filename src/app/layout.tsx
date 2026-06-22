import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/* ─── Fonts ──────────────────────────────────────────────────── */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets:  ["latin"],
  display:  "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets:  ["latin"],
  display:  "swap",
});

/* ─── Site-level Metadata ────────────────────────────────────── */
export const metadata: Metadata = {
  title:       "Ayan Aslam | Backend Engineer & AI Systems Builder",
  description:
    "Portfolio of Ayan Aslam — backend engineer specialising in distributed systems, AI pipelines, and production-grade API architecture. Studied at FAST-NUCES.",
  keywords: [
    "Ayan Aslam",
    "backend engineer",
    "AI systems",
    "distributed systems",
    "FAST-NUCES",
    "portfolio",
    "Python",
    "TypeScript",
  ],
  authors:  [{ name: "Ayan Aslam" }],
  creator:  "Ayan Aslam",
  openGraph: {
    title:       "Ayan Aslam | Backend Engineer & AI Systems Builder",
    description: "Production-focused backend engineering and AI systems.",
    type:        "website",
    locale:      "en_PK",
  },
  robots: {
    index:  true,
    follow: true,
  },
};

/* ─── Root Layout ────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        {children}
      </body>
    </html>
  );
}
