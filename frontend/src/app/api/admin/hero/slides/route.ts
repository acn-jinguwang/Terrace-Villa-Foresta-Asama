import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb, isTestReq, ensureV3Tables } from '@/lib/db';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

async function checkAuth() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? await verifySessionToken(token) : null;
}

export async function GET(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const isTest = isTestReq(request);
  await ensureV3Tables(isTest);
  const db = getDb(isTest);
  const [rows] = await db.query('SELECT * FROM hero_slides ORDER BY display_order ASC') as any[][];
  return NextResponse.json(rows, { headers: NO_CACHE });
}

export async function POST(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const isTest = isTestReq(request);
  await ensureV3Tables(isTest);
  const db = getDb(isTest);
  const b = await request.json();
  const [result] = await db.query(
    'INSERT INTO hero_slides (image_url, alt_zh, alt_ja, alt_en, display_order) VALUES (?,?,?,?,?)',
    [b.image_url || '', b.alt_zh || '', b.alt_ja || '', b.alt_en || '', b.display_order ?? 0],
  ) as any[];
  const [[row]] = await db.query('SELECT * FROM hero_slides WHERE id = ?', [(result as any).insertId]) as any[][];
  return NextResponse.json(row, { status: 201, headers: NO_CACHE });
}
