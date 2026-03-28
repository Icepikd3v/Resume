import type { Metadata } from "next";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

const headline = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-headline" });
const body = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Samuel Farmer | Resume Site",
  description:
    "Public resume portfolio showcasing full-stack development, language depth, and project case studies."
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${headline.variable} ${body.variable}`}>
        <div className="site-bg" aria-hidden="true" />
        <div className="site-bg-glow site-bg-glow-a" aria-hidden="true" />
        <div className="site-bg-glow site-bg-glow-b" aria-hidden="true" />
        <div className="site-bg-noise" aria-hidden="true" />
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
