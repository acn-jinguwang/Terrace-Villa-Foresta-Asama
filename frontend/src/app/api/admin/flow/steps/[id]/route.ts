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
      `UPDATE flow_steps SET
         step_number = ?, step_label_zh = ?, step_label_ja = ?, step_label_en = ?,
         title_zh = ?, title_ja = ?, title_en = ?,
         description_zh = ?, description_ja = ?, description_en = ?,
         cta_label_zh = ?, cta_label_ja = ?, cta_label_en = ?,
         cta_url = ?, is_external = ?, display_order = ?, is_enabled = ?
       WHERE id = ?`,
      [
        b.step_number ?? 0,
        b.step_label_zh ?? '', b.step_label_ja ?? '', b.step_label_en ?? '',
        b.title_zh ?? '',       b.title_ja ?? '',       b.title_en ?? '',
        b.description_zh ?? '', b.description_ja ?? '', b.description_en ?? '',
        b.cta_label_zh ?? '',   b.cta_label_ja ?? '',   b.cta_label_en ?? '',
        b.cta_url ?? '',
        b.is_external ? 1 : 0,
        b.display_order ?? 0,
        b.is_enabled !== false ? 1 : 0,
        id,
      ],
    );

    const [rows] = await db.query('SELECT * FROM flow_steps WHERE id = ?', [id]) as any[][];
    const row = (rows as any[])[0];
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(
      {
        id:            row.id,
        step_number:   row.step_number ?? 0,
        step_label:    { zh: row.step_label_zh ?? '', ja: row.step_label_ja ?? '', en: row.step_label_en ?? '' },
        title:         { zh: row.title_zh ?? '',      ja: row.title_ja ?? '',      en: row.title_en ?? '' },
        description:   { zh: row.description_zh ?? '', ja: row.description_ja ?? '', en: row.description_en ?? '' },
        cta_label:     { zh: row.cta_label_zh ?? '',  ja: row.cta_label_ja ?? '',  en: row.cta_label_en ?? '' },
        cta_url:       row.cta_url ?? '',
        is_external:   row.is_external === 1,
        display_order: row.display_order ?? 0,
        is_enabled:    row.is_enabled === 1,
      },
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[admin/flow/steps/[id] PUT]', err);
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

    await db.query('DELETE FROM flow_steps WHERE id = ?', [id]);
    return NextResponse.json({ success: true }, { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/flow/steps/[id] DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
