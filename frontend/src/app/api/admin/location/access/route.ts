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

function rowToAccess(a: any) {
  return {
    id:            a.id,
    origin:        { zh: a.origin_zh ?? '',   ja: a.origin_ja ?? '',   en: a.origin_en ?? '' },
    duration:      { zh: a.duration_zh ?? '', ja: a.duration_ja ?? '', en: a.duration_en ?? '' },
    display_order: a.display_order ?? 0,
    is_enabled:    a.is_enabled === 1,
  };
}

export async function GET(request: Request) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const [rows] = await db.query('SELECT * FROM location_access ORDER BY display_order ASC') as any[][];
    return NextResponse.json((rows as any[]).map(rowToAccess), { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/location/access GET]', err);
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
      `INSERT INTO location_access
         (origin_zh, origin_ja, origin_en, duration_zh, duration_ja, duration_en, display_order, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        b.origin_zh ?? '',   b.origin_ja ?? '',   b.origin_en ?? '',
        b.duration_zh ?? '', b.duration_ja ?? '', b.duration_en ?? '',
        b.display_order ?? 0,
      ],
    ) as any[];

    const [rows] = await db.query('SELECT * FROM location_access WHERE id = ?', [result.insertId]) as any[][];
    return NextResponse.json(rowToAccess((rows as any[])[0]), { status: 201, headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/location/access POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
