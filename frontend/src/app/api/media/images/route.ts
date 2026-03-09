import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const MANIFEST_PATH = path.join(process.cwd(), 'data', 'media-manifest.json');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let entries: { type: string; category: string }[] = [];
    try {
      const raw = await readFile(MANIFEST_PATH, 'utf-8');
      entries = JSON.parse(raw);
    } catch {
      entries = [];
    }

    let filtered = entries.filter((e) => e.type === 'image');
    if (category) {
      filtered = filtered.filter((e) => e.category === category);
    }

    return NextResponse.json(filtered);
  } catch (err) {
    return NextResponse.json([], { status: 200 });
  }
}
