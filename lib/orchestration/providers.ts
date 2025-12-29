import { LLMProvider, Message, CompletionResult } from './types';

class OpenAIProvider implements LLMProvider {
  id = 'openai';

  async complete({ messages, model, apiKey, systemPrompt }: {
    messages: Message[];
    model: string;
    apiKey?: string;
    systemPrompt?: string;
  }): Promise<CompletionResult> {
    if (!apiKey) throw new Error('API Key required for OpenAI');

    const finalMessages = [...messages];
    if (systemPrompt) {
      // Ensure system prompt is first
      if (finalMessages.length > 0 && finalMessages[0].role === 'system') {
          // Replace existing? Or prepend? Let's prepend or assume caller handles it.
          // But to be safe:
          finalMessages.unshift({ role: 'system', content: systemPrompt });
      } else {
          finalMessages.unshift({ role: 'system', content: systemPrompt });
      }
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: finalMessages,
      })
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`OpenAI Error: ${err}`);
    }

    const data = await res.json();
    return {
        content: data.choices[0].message.content,
        usage: data.usage
    };
  }

  async listModels(apiKey?: string): Promise<string[]> {
      // Mock list for now to avoid extra calls/logic
      return ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  }
}

const providers: Record<string, LLMProvider> = {
    openai: new OpenAIProvider(),
    // 'openai-assistants' is handled specially in the route logic usually,
    // but we could wrap it here if we wanted to unify it.
    // For now, let's keep it simple.
};

export function getProvider(name: string): LLMProvider | undefined {
    return providers[name];
}
