import { Message, Participant } from './types';
import { getProvider } from './providers';

export async function runDebate({ history, participants, rounds = 1 }: {
    history: Message[];
    participants: Participant[];
    rounds?: number;
}): Promise<{ content: string; history: Message[] }> {

    const currentHistory = [...history];
    let resultLog = '';

    // Only run one round per call for now to keep it stateless/interactive?
    // The previous implementation implied running the whole debate.
    // Let's run one full cycle (each participant speaks once).

    for (const p of participants) {
        const provider = getProvider(p.provider);
        if (!provider) {
            console.warn(`Provider ${p.provider} not found for participant ${p.name}`);
            continue;
        }

        const systemPrompt = `You are ${p.name}, acting as a ${p.role}.

        Instructions:
        ${p.systemPrompt}

        Review the conversation history and provide your input.
        Be constructive, specific, and concise.`;

        try {
            // Call provider
            const response = await provider.complete({
                messages: currentHistory,
                model: p.model,
                apiKey: p.apiKey,
                systemPrompt
            });

            // Append to history
            // We use 'assistant' role, but we might want to prefix content with name if the provider doesn't support 'name' strictly.
            // But let's try using 'name' property if possible, or just append to content for clarity in the UI.
            const content = response.content;
            const msg: Message = {
                role: 'assistant',
                content: content,
                name: p.id // use ID as name to be safe with regex validation (OpenAI requires specific format)
            };

            currentHistory.push(msg);
            resultLog += `\n\n**${p.name} (${p.role}):**\n${content}`;
        } catch (err) {
            console.error(`Error processing turn for ${p.name}:`, err);
            resultLog += `\n\n**${p.name}:** [Error generating response]`;
        }
    }

    return { content: resultLog, history: currentHistory };
}
