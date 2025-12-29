import { CompletionParams, CompletionResult, ProviderInterface } from '../types';

export const openaiProvider: ProviderInterface = {
  id: 'openai',
  async complete(params: CompletionParams): Promise<CompletionResult> {
    const { messages, apiKey, model = 'gpt-4o', systemPrompt } = params;

    const msgs = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant', // Simplified mapping
        content: m.content
    }));

    if (systemPrompt) {
        // @ts-ignore - OpenAI supports system role, but our simple map above forces user/assistant.
        // We'll trust the API accepts it or adjust the type if needed.
        // Actually standard OpenAI chat format allows 'system'.
        msgs.unshift({ role: 'system', content: systemPrompt });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: msgs,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return { content: data.choices[0]?.message?.content || '' };
  },

  async listModels(apiKey?: string): Promise<string[]> {
     if (!apiKey) return [];
     try {
       const resp = await fetch('https://api.openai.com/v1/models', {
           headers: { 'Authorization': `Bearer ${apiKey}` }
       });
       if (!resp.ok) return [];
       const data = await resp.json();
       return data.data.map((m: { id: string }) => m.id).sort();
     } catch(e) { return []; }
  }
};
