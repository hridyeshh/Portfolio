import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next, Bricolage_Grotesque, Caveat } from "next/font/google";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { site } from "../lib/content.ts";
import "./globals.css";

const sentence = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-sentence", axes: ["opsz"] });
// next/font has no fallback metrics for either Atkinson family, so its size adjustment is off.
const body = Atkinson_Hyperlegible_Next({ subsets: ["latin"], variable: "--font-body", adjustFontFallback: false });
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" });
const figure = Atkinson_Hyperlegible_Mono({ subsets: ["latin"], variable: "--font-figure", preload: false, adjustFontFallback: false });
// Only on the painted book spines and in figures. Self-hosted because next/font doesn't list it. The OFL license sits beside the file.
const caslon = localFont({
  src: "./fonts/LibreCaslonCondensed-latin.woff2",
  weight: "400 700",
  variable: "--font-caslon",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
  openGraph: { title: site.name, description: site.description, type: "website" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sentence.variable} ${body.variable} ${hand.variable} ${figure.variable} ${caslon.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          {site.skip}
        </a>
        <main id="main">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
