import type { Metadata } from "next";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { getSiteContent } from "@/lib/content-store";

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();

  return (
    <html lang="en">
      <body className={`${headline.variable} ${body.variable}`}>
        <div className="site-bg" aria-hidden="true" />
        <div className="site-bg-glow site-bg-glow-a" aria-hidden="true" />
        <div className="site-bg-glow site-bg-glow-b" aria-hidden="true" />
        <div className="site-bg-noise" aria-hidden="true" />
        <SiteHeader />
        <main>
          {children}
          <footer className="site-footer">
            © {new Date().getFullYear()} {content.name} ({content.alias}) · Resume Site
            <p className="site-footer-credit">Visual style inspired by Galaxy Dark Mode Crypto UI Dashboard (Community).</p>
          </footer>
        </main>
      </body>
    </html>
  );
}
