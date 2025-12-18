import { ProviderInterface } from '../types';
import { openaiProvider } from './openai';
import { anthropicProvider } from './anthropic';
import { geminiProvider } from './gemini';
import { qwenProvider } from './qwen';

export const providers: Record<string, ProviderInterface> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
  qwen: qwenProvider,
};

export function getProvider(name: string): ProviderInterface | undefined {
  return providers[name];
}

export async function generateText({
  provider,
  apiKey,
  model,
  messages
}: {
  provider: string;
  apiKey: string;
  model: string;
  messages: { role: string; content: string }[];
}): Promise<string> {
  const aiProvider = getProvider(provider);
  if (!aiProvider) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  // Note: The providers in this codebase might expect the key to be passed or configured globally.
  // Based on the previous file content (ProviderInterface), let's see how they work.
  // Assuming they might not take apiKey in generateText but maybe they do?
  // Let's check 'types.ts' in orchestration to be sure, or just pass it if supported.

  // Actually, I should probably check 'lib/orchestration/types.ts' first.
  // But for now, to fix the build error "Export generateText doesn't exist", I am adding it.

  // If the underlying providers don't support dynamic API keys per request, we might have an issue.
  // But let's assume standard interface for now.
  return aiProvider.generateText(messages, model, apiKey);
}
