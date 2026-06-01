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

function rowToStat(s: any) {
  return {
    id:            s.id,
    value_text:    s.value_text ?? '',
    label:         { zh: s.label_zh ?? '', ja: s.label_ja ?? '', en: s.label_en ?? '' },
    display_order: s.display_order ?? 0,
    is_enabled:    s.is_enabled === 1,
  };
}

export async function GET(request: Request) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const [rows] = await db.query('SELECT * FROM hero_stats ORDER BY display_order ASC') as any[][];
    return NextResponse.json((rows as any[]).map(rowToStat), { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/hero/stats GET]', err);
    return NextResponse.json({ error: String(err) }, { status: 500, headers: NO_CACHE });
  }
}

export async function POST(request: Request) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const b = await request.json();

    const [result] = await db.query(
      `INSERT INTO hero_stats (value_text, label_zh, label_ja, label_en, display_order, is_enabled)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [b.value_text ?? '', b.label_zh ?? '', b.label_ja ?? '', b.label_en ?? '', b.display_order ?? 0],
    ) as any[];

    const [rows] = await db.query('SELECT * FROM hero_stats WHERE id = ?', [result.insertId]) as any[][];
    return NextResponse.json(rowToStat((rows as any[])[0]), { status: 201, headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/hero/stats POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
