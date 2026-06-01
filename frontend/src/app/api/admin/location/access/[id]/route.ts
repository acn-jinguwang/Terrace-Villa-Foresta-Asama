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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const b = await request.json();

    await db.query(
      `UPDATE location_access SET
         origin_zh = ?, origin_ja = ?, origin_en = ?,
         duration_zh = ?, duration_ja = ?, duration_en = ?,
         display_order = ?, is_enabled = ?
       WHERE id = ?`,
      [
        b.origin_zh ?? '',   b.origin_ja ?? '',   b.origin_en ?? '',
        b.duration_zh ?? '', b.duration_ja ?? '', b.duration_en ?? '',
        b.display_order ?? 0,
        b.is_enabled !== false ? 1 : 0,
        id,
      ],
    );

    const [rows] = await db.query('SELECT * FROM location_access WHERE id = ?', [id]) as any[][];
    const row = (rows as any[])[0];
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(
      {
        id:            row.id,
        origin:        { zh: row.origin_zh ?? '',   ja: row.origin_ja ?? '',   en: row.origin_en ?? '' },
        duration:      { zh: row.duration_zh ?? '', ja: row.duration_ja ?? '', en: row.duration_en ?? '' },
        display_order: row.display_order ?? 0,
        is_enabled:    row.is_enabled === 1,
      },
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[admin/location/access/[id] PUT]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    await db.query('DELETE FROM location_access WHERE id = ?', [id]);
    return NextResponse.json({ success: true }, { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/location/access/[id] DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
