import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";

// Bold display font for headings, exposed as font-display via app/globals.css
const display = Space_Grotesk({
  variable: "--font-display-family",
  subsets: ["latin"],
});

// Body copy font, exposed as font-body via app/globals.css
const body = Inter({
  variable: "--font-body-family",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://insightix.example.com"
  ),
  title: {
    default: "Insightix",
    template: "%s | Insightix",
  },
  description: "The Insightix tech club",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-bg font-body text-brand-text">
        <div className="bg-grid" aria-hidden="true" />
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
