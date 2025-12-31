import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
        return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const basePath = process.cwd();
    const fullPath = path.resolve(basePath, filePath);

    // Security check: ensure we don't break out of the project root
    if (!fullPath.startsWith(basePath)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const content = await fs.readFile(fullPath, 'utf-8');

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
