
import { LLMProvider, Message, CompletionResult } from './types';

// Simple interface for review requests
export interface ReviewRequest {
    codeContext: string;
    provider: string;
    model: string;
    apiKey: string;
    systemPrompt?: string;
    reviewType?: 'simple' | 'comprehensive';
}

export async function runCodeReview(request: ReviewRequest): Promise<string> {
    const { getProvider } = await import('./providers');
    const provider = getProvider(request.provider);
    
    if (!provider) {
        throw new Error(`Provider ${request.provider} not found`);
    }

    if (request.reviewType === 'comprehensive') {
        return await runComprehensiveReview(request, provider);
    }

    const systemPrompt = request.systemPrompt || `You are an expert code reviewer.
    Review the provided code context.
    - Identify potential bugs, security issues, and performance bottlenecks.
    - Suggest improvements for readability and maintainability.
    - Be concise and actionable.`;

    const result = await provider.complete({
        messages: [{ role: 'user', content: request.codeContext }],
        model: request.model,
        apiKey: request.apiKey,
        systemPrompt
    });

    return result.content;
}

async function runComprehensiveReview(request: ReviewRequest, provider: any): Promise<string> {
    const personas = [
        {
            role: 'Security Expert',
            prompt: 'You are a Security Expert. Review this code strictly for security vulnerabilities, injection risks, and data handling issues. Be brief and list only high-severity concerns.'
        },
        {
            role: 'Performance Engineer',
            prompt: 'You are a Performance Engineer. Review this code for algorithmic inefficiencies, memory leaks, and scaling bottlenecks. Be brief.'
        },
        {
            role: 'Clean Code Advocate',
            prompt: 'You are a Senior Engineer focused on maintainability. Review naming, structure, and adherence to SOLID principles. Be brief.'
        }
    ];

    const results = await Promise.all(personas.map(async (persona) => {
        try {
            const res = await provider.complete({
                messages: [{ role: 'user', content: request.codeContext }],
                model: request.model,
                apiKey: request.apiKey,
                systemPrompt: persona.prompt
            });
            return `### ${persona.role} Review\n${res.content}`;
        } catch (e) {
            return `### ${persona.role} Review\n(Failed to generate review: ${e instanceof Error ? e.message : 'Unknown error'})`;
        }
    }));

    return `# Comprehensive Code Review\n\n${results.join('\n\n')}`;
}
