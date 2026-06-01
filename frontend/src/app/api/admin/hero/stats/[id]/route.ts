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
      `UPDATE hero_stats
       SET value_text = ?, label_zh = ?, label_ja = ?, label_en = ?, display_order = ?, is_enabled = ?
       WHERE id = ?`,
      [
        b.value_text ?? '',
        b.label_zh ?? '', b.label_ja ?? '', b.label_en ?? '',
        b.display_order ?? 0,
        b.is_enabled !== false ? 1 : 0,
        id,
      ],
    );

    const [rows] = await db.query('SELECT * FROM hero_stats WHERE id = ?', [id]) as any[][];
    const row = (rows as any[])[0];
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(
      {
        id:            row.id,
        value_text:    row.value_text ?? '',
        label:         { zh: row.label_zh ?? '', ja: row.label_ja ?? '', en: row.label_en ?? '' },
        display_order: row.display_order ?? 0,
        is_enabled:    row.is_enabled === 1,
      },
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[admin/hero/stats/[id] PUT]', err);
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

    await db.query('DELETE FROM hero_stats WHERE id = ?', [id]);
    return NextResponse.json({ success: true }, { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/hero/stats/[id] DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
