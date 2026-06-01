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
      `UPDATE villas SET
         villa_key = ?, name_zh = ?, name_ja = ?, name_en = ?,
         spec_zh = ?, spec_ja = ?, spec_en = ?,
         tag_zh = ?, tag_ja = ?, tag_en = ?,
         description_zh = ?, description_ja = ?, description_en = ?,
         main_image_url = ?, display_order = ?, is_enabled = ?
       WHERE id = ?`,
      [
        b.villa_key ?? '',
        b.name_zh ?? '', b.name_ja ?? '', b.name_en ?? '',
        b.spec_zh ?? '',  b.spec_ja ?? '',  b.spec_en ?? '',
        b.tag_zh ?? '',   b.tag_ja ?? '',   b.tag_en ?? '',
        b.description_zh ?? '', b.description_ja ?? '', b.description_en ?? '',
        b.main_image_url ?? '',
        b.display_order ?? 0,
        b.is_enabled !== false ? 1 : 0,
        id,
      ],
    );

    const [rows] = await db.query('SELECT * FROM villas WHERE id = ?', [id]) as any[][];
    const row = (rows as any[])[0];
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(
      {
        id:             row.id,
        villa_key:      row.villa_key ?? '',
        name:           { zh: row.name_zh ?? '',        ja: row.name_ja ?? '',        en: row.name_en ?? '' },
        spec:           { zh: row.spec_zh ?? '',        ja: row.spec_ja ?? '',        en: row.spec_en ?? '' },
        tag:            { zh: row.tag_zh ?? '',         ja: row.tag_ja ?? '',         en: row.tag_en ?? '' },
        description:    { zh: row.description_zh ?? '', ja: row.description_ja ?? '', en: row.description_en ?? '' },
        main_image_url: row.main_image_url ?? '',
        display_order:  row.display_order ?? 0,
        is_enabled:     row.is_enabled === 1,
      },
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[admin/villas/[id] PUT]', err);
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

    await db.query('DELETE FROM villas WHERE id = ?', [id]);
    return NextResponse.json({ success: true }, { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/villas/[id] DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
