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
    `UPDATE featured_videos SET
       title_zh=?, title_ja=?, title_en=?,
       video_url=?, thumbnail_url=?,
       description_zh=?, description_ja=?, description_en=?,
       display_order=?, is_enabled=?
     WHERE id = ?`,
    [b.title_zh || '', b.title_ja || '', b.title_en || '',
     b.video_url || '', b.thumbnail_url || '',
     b.description_zh || '', b.description_ja || '', b.description_en || '',
     b.display_order ?? 0, b.is_enabled !== false ? 1 : 0, id],
  );
  const [[row]] = await db.query('SELECT * FROM featured_videos WHERE id = ?', [id]) as any[][];
  return NextResponse.json(row, { headers: NO_CACHE });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const isTest = isTestReq(request);
  await ensureV3Tables(isTest);
  const db = getDb(isTest);
  await db.query('DELETE FROM featured_videos WHERE id = ?', [id]);
  return new NextResponse(null, { status: 204 });
}
