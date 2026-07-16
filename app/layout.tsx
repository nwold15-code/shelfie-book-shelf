import type { Metadata } from "next";
import { Fraunces, Newsreader } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/nav-bar";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Shelfie — Your Book Shelf",
  description: "Scan, sort, rate, and discover your next read.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${newsreader.variable} font-body`}>
        <div className="min-h-screen flex flex-col">
          <NavBar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
