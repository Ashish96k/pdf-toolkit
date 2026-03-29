import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import BackgroundBlobs from "@/components/ui/BackgroundBlobs";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "PDF Toolkit — Free PDF merge, split, compress & more",
    template: "%s",
  },
  description:
    "Free online PDF tools: merge, split, compress, convert to Word, and edit PDFs in your browser. Fast, secure, no signup required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} flex min-h-screen flex-col font-sans antialiased`}
      >
        <Analytics />
        <div className="relative min-h-screen bg-page-gradient">
          <BackgroundBlobs />
          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
