import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dir = searchParams.get('path') || '.';
    const basePath = process.cwd();
    const fullPath = path.resolve(basePath, dir);

    // Security check: ensure we don't break out of the project root
    if (!fullPath.startsWith(basePath)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const entries = await fs.readdir(fullPath, { withFileTypes: true });

    const files = entries.map(entry => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      path: path.relative(basePath, path.join(fullPath, entry.name))
    }));

    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
