import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";
import "@livekit/components-styles";
import "../styles/video-call.css";
import { OneSignalInitializer } from "@/components/shared/OneSignalInitializer";
import { PreloadOptimizer } from "@/components/shared/PreloadOptimizer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FastBite Group - Team Collaboration Platform",
  description:
    "Real-time collaboration and communication platform for teams and communities",
  // Optimize resource loading to reduce preload warnings
  other: {
    "resource-hints": "preload",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <OneSignalInitializer />
          <PreloadOptimizer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
