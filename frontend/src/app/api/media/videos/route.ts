import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const MANIFEST_PATH = path.join(process.cwd(), 'data', 'media-manifest.json');

export async function GET() {
  try {
    let entries: { type: string }[] = [];
    try {
      const raw = await readFile(MANIFEST_PATH, 'utf-8');
      entries = JSON.parse(raw);
    } catch {
      entries = [];
    }

    return NextResponse.json(entries.filter((e) => e.type === 'video'));
  } catch {
    return NextResponse.json([]);
  }
}
