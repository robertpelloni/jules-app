import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, prompt, title, tags, isFavorite } = body;

    const template = await prisma.sessionTemplate.update({
      where: { id },
      data: {
        name,
        description,
        prompt,
        title,
        isFavorite,
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
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.sessionTemplate.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
