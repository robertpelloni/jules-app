"use client";

import { SessionTemplate } from "@/types/jules";

interface TemplatesPageProps {
  onStartSession: (template: SessionTemplate) => void;
}

export function TemplatesPage({ onStartSession }: TemplatesPageProps) {
  return <div>Templates Page</div>;
}
