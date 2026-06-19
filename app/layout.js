import { Geist } from "next/font/google";
import "./globals.css";

// SOURCE: ghuynguyen.md — Typography section
// Geist: Vercel's typeface, weights 200/300/400/500/700
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "700", "900"],
});

export const metadata = {
  title: "Portfolio",
  description: "Multidisciplinary Designer Portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
