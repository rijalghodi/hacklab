import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import "@xyflow/react/dist/style.css";
import "./react-flow.css";
import "./globals.css";

import {
  BRAND_AUTHOR_EMAIL,
  BRAND_AUTHOR_NAME,
  BRAND_AUTHOR_URL,
  BRAND_DESCRIPTION,
  BRAND_KEYWORDS,
  BRAND_NAME,
  BRAND_OG_IMAGE,
  BRAND_TAGLINE,
  BRAND_URL,
} from "@/lib/constants/brand";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${BRAND_NAME} - ${BRAND_TAGLINE}`,
  description: `${BRAND_DESCRIPTION}`,
  keywords: BRAND_KEYWORDS,
  creator: BRAND_AUTHOR_EMAIL,
  authors: [{ name: BRAND_AUTHOR_NAME, url: BRAND_AUTHOR_URL }],
  openGraph: {
    title: `${BRAND_NAME} - ${BRAND_TAGLINE}`,
    description: BRAND_DESCRIPTION,
    url: BRAND_URL,
    siteName: BRAND_NAME,
    images: [
      {
        url: BRAND_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: BRAND_NAME,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} - ${BRAND_TAGLINE}`,
    description: BRAND_DESCRIPTION,
    images: [BRAND_OG_IMAGE],
    site: "@hacklabio",
    creator: "@hacklabio",
  },
  alternates: {
    canonical: BRAND_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${sans.className} ${mono.variable} dark`}>{children}</body>
    </html>
  );
}
