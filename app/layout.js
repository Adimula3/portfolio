import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";

// Workhorse: Geist (modern grotesque) for all UI/body/display text.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "700", "900"],
});

// Editorial accent: Instrument Serif — used sparingly for italic accent words,
// self-hosted via next/font (replaces the render-blocking Fontshare @import).
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata = {
  // Set NEXT_PUBLIC_SITE_URL to the production domain once deployed.
  // Left unset, Next falls back to its deploy-aware default (e.g. VERCEL_URL).
  ...(process.env.NEXT_PUBLIC_SITE_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) }
    : {}),
  title: {
    default: "Yinka Kolawole — Full-Stack Developer",
    template: "%s — Yinka Kolawole",
  },
  description:
    "Yinka Kolawole is a full-stack developer building digital products end to end — from polished interfaces to back-end services, databases, and APIs.",
  keywords: [
    "Yinka Kolawole",
    "full-stack developer",
    "front-end developer",
    "back-end developer",
    "React",
    "Node.js",
    "API development",
    "portfolio",
  ],
  authors: [{ name: "Yinka Kolawole" }],
  openGraph: {
    title: "Yinka Kolawole — Full-Stack Developer",
    description:
      "Full-stack developer building digital products end to end — from interfaces to back-end services, databases, and APIs.",
    siteName: "Yinka Kolawole",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yinka Kolawole — Full-Stack Developer",
    description:
      "Full-stack developer building digital products end to end — from interfaces to back-end services, databases, and APIs.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
