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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const isTest = isTestReq(request);
  await ensureV3Tables(isTest);
  const db = getDb(isTest);
  const b = await request.json();
  await db.query(
    'UPDATE hero_slides SET image_url=?, alt_zh=?, alt_ja=?, alt_en=?, display_order=?, is_enabled=? WHERE id=?',
    [b.image_url || '', b.alt_zh || '', b.alt_ja || '', b.alt_en || '', b.display_order ?? 0, b.is_enabled !== false ? 1 : 0, id],
  );
  const [[row]] = await db.query('SELECT * FROM hero_slides WHERE id = ?', [id]) as any[][];
  return NextResponse.json(row, { headers: NO_CACHE });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const isTest = isTestReq(request);
  await ensureV3Tables(isTest);
  const db = getDb(isTest);
  await db.query('DELETE FROM hero_slides WHERE id = ?', [id]);
  return new NextResponse(null, { status: 204 });
}
