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
  const [[vs]] = await db.query('SELECT * FROM video_section WHERE id = 1') as any[][];
  const [videos] = await db.query('SELECT * FROM featured_videos ORDER BY display_order ASC') as any[][];
  return NextResponse.json({ section: vs ?? {}, videos }, { headers: NO_CACHE });
}

export async function POST(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const isTest = isTestReq(request);
  await ensureV3Tables(isTest);
  const db = getDb(isTest);
  const b = await request.json();
  const [result] = await db.query(
    `INSERT INTO featured_videos
       (title_zh, title_ja, title_en, video_url, thumbnail_url, description_zh, description_ja, description_en, display_order)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [b.title_zh || '', b.title_ja || '', b.title_en || '',
     b.video_url || '', b.thumbnail_url || '',
     b.description_zh || '', b.description_ja || '', b.description_en || '',
     b.display_order ?? 0],
  ) as any[];
  const [[row]] = await db.query('SELECT * FROM featured_videos WHERE id = ?', [(result as any).insertId]) as any[][];
  return NextResponse.json(row, { status: 201, headers: NO_CACHE });
}

export async function PATCH(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const isTest = isTestReq(request);
  await ensureV3Tables(isTest);
  const db = getDb(isTest);
  const { section } = await request.json();
  if (section) {
    await db.query(
      `UPDATE video_section SET eyebrow_zh=?, eyebrow_ja=?, eyebrow_en=?,
         title_zh=?, title_ja=?, title_en=?, subtitle_zh=?, subtitle_ja=?, subtitle_en=? WHERE id = 1`,
      [section.eyebrow_zh || '', section.eyebrow_ja || '', section.eyebrow_en || '',
       section.title_zh || '',   section.title_ja || '',   section.title_en || '',
       section.subtitle_zh || '',section.subtitle_ja || '',section.subtitle_en || ''],
    );
  }
  return NextResponse.json({ ok: true }, { headers: NO_CACHE });
}
