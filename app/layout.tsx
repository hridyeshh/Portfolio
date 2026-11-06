import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next, Caveat } from "next/font/google";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { Footer } from "../components/Footer.tsx";
import { Nav } from "../components/Nav.tsx";
import { site } from "../lib/content.ts";
import "./globals.css";

// Not in next/font's Google list yet, so it's self-hosted. The OFL license sits beside the file.
const display = localFont({
  src: "./fonts/LibreCaslonCondensed-latin.woff2",
  weight: "400 700",
  variable: "--font-display",
  adjustFontFallback: "Times New Roman",
});
// next/font has no fallback metrics for either Atkinson family, so its size adjustment is off.
const body = Atkinson_Hyperlegible_Next({ subsets: ["latin"], variable: "--font-body", adjustFontFallback: false });
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand" });
const figure = Atkinson_Hyperlegible_Mono({ subsets: ["latin"], variable: "--font-figure", preload: false, adjustFontFallback: false });

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${hand.variable} ${figure.variable}`}>
      <body>
        <a href="#main" className="skip">
          {site.skip}
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
