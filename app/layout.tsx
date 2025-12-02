import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { JulesProvider } from "@/lib/jules/provider";
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
  title: "Jules Task Manager",
  description: "A mobile-friendly task manager for Jules AI agent sessions",
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
        <JulesProvider>{children}</JulesProvider>
      </body>
    </html>
  );
}
