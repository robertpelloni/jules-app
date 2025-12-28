'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { JulesProvider } from '@/lib/jules/provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-zinc-100 antialiased selection:bg-white/10`}>
        <JulesProvider>
          <TooltipProvider>
            {children}
            <Toaster position="bottom-right" theme="dark" className="font-mono text-xs uppercase" />
          </TooltipProvider>
        </JulesProvider>
      </body>
    </html>
  );
}
