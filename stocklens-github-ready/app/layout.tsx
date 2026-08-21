import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stocklens — Company & stock intelligence",
  description: "Search any US-listed company for live market data, price history, financial performance, and the latest news.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Stocklens — Company & stock intelligence",
    description: "Know the company. Understand the stock.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Stocklens market intelligence" }],
  },
  twitter: { card: "summary_large_image", title: "Stocklens", description: "Know the company. Understand the stock.", images: ["/og.png"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
