import { NextRequest, NextResponse } from 'next/server';
import { runDebate } from '@/lib/orchestration/debate';
import { DebateConfig } from '@/lib/orchestration/types';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // body should match DebateConfig + history
        const { topic, rounds, participants, history } = body;

        if (!topic || !participants || participants.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields: topic, participants' },
                { status: 400 }
            );
        }

        const result = await runDebate({
            history: history || [],
            participants,
            rounds: rounds || 1,
            topic
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Debate failed:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
