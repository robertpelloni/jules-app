import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { SessionTemplate } from '@prisma/client';

export async function GET() {
  try {
    const templates = await prisma.sessionTemplate.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    const formatted = templates.map((t: SessionTemplate) => ({
        ...t,
        tags: t.tags ? t.tags.split(',') : [],
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString()
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, prompt, title, tags, isFavorite } = body;

    const template = await prisma.sessionTemplate.create({
      data: {
        name,
        description,
        prompt,
        title,
        isFavorite: isFavorite || false,
        tags: Array.isArray(tags) ? tags.join(',') : (tags || ''),
      }
    });

    return NextResponse.json({
        ...template,
        tags: template.tags ? template.tags.split(',') : [],
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
