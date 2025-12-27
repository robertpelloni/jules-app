<<<<<<< HEAD
<<<<<<< HEAD
import type { Metadata, Viewport } from "next";
=======
import type { Metadata } from "next";
>>>>>>> origin/feat-session-kanban-board-4406113728067866336
=======
import type { Metadata } from "next";
>>>>>>> origin/fix-remove-debug-logs-16472708773165476071
import { Geist, Geist_Mono } from "next/font/google";
import { JulesProvider } from "@/lib/jules/provider";
import { ThemeProvider } from "@/components/theme-provider";
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

<<<<<<< HEAD
<<<<<<< HEAD
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

=======
>>>>>>> origin/feat-session-kanban-board-4406113728067866336
=======
>>>>>>> origin/fix-remove-debug-logs-16472708773165476071
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <JulesProvider>{children}</JulesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
