import type { Metadata } from "next";
import { Geist, Geist_Mono, Rubik, Montserrat, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/navbar/navbar"
import Providers from "./providers";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-rubik",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MH Wilds Builder",
    template: "%s | MH Wilds Builder",
  },
  description: "Create, save, and share Monster Hunter Wilds builds.",
  metadataBase: new URL("https://www.mhwildsbuilder.com"),
  openGraph: {
    title: "MH Wilds Builder",
    description: "Create, save, and share Monster Hunter Wilds builds.",
    url: "https://www.mhwildsbuilder.com",
    siteName: "MH Wilds Builder",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Navbar />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
