"use client";

import { Suspense, useEffect } from "react";
import { useJules } from "@/lib/jules/provider";
import { AppLayout } from "@/components/app-layout";
import { useRouter } from "next/navigation";

export default function Home() {
  const { client, isLoading } = useJules();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !client) {
        router.push('/login');
    }
  }, [isLoading, client, router]);

  if (isLoading || !client) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-sm font-mono text-muted-foreground animate-pulse uppercase tracking-widest">
          Initializing Workspace...
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppLayout />
    </Suspense>
  );
}
