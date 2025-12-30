import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const logs = await prisma.keeperLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to last 100 logs
    });
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const log = await prisma.keeperLog.create({
      data: {
        sessionId: body.sessionId,
        type: body.type,
        message: body.message,
        metadata: body.details ? JSON.stringify(body.details) : undefined,
      }
    });
    return NextResponse.json(log);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 });
  }
}
