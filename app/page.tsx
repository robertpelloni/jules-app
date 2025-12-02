'use client';

import { useJules } from '@/lib/jules/provider';
import { ApiKeySetup } from '@/components/api-key-setup';
import { AppLayout } from '@/components/app-layout';

export default function Home() {
  const { apiKey } = useJules();

  if (!apiKey) {
    return <ApiKeySetup />;
  }

  return <AppLayout />;
}
