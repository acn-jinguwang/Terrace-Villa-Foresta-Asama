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
      `UPDATE stay_plans SET
         plan_key = ?, tag_zh = ?, tag_ja = ?, tag_en = ?, step_number_text = ?,
         title_zh = ?, title_ja = ?, title_en = ?,
         description_zh = ?, description_ja = ?, description_en = ?,
         price_text = ?, main_image_url = ?, cta_url = ?, is_external = ?,
         display_order = ?, is_enabled = ?
       WHERE id = ?`,
      [
        b.plan_key ?? '',
        b.tag_zh ?? '',         b.tag_ja ?? '',         b.tag_en ?? '',
        b.step_number_text ?? '',
        b.title_zh ?? '',       b.title_ja ?? '',       b.title_en ?? '',
        b.description_zh ?? '', b.description_ja ?? '', b.description_en ?? '',
        b.price_text ?? '',
        b.main_image_url ?? '',
        b.cta_url ?? '',
        b.is_external ? 1 : 0,
        b.display_order ?? 0,
        b.is_enabled !== false ? 1 : 0,
        id,
      ],
    );

    const [rows] = await db.query('SELECT * FROM stay_plans WHERE id = ?', [id]) as any[][];
    const row = (rows as any[])[0];
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(
      {
        id:               row.id,
        plan_key:         row.plan_key ?? '',
        tag:              { zh: row.tag_zh ?? '',         ja: row.tag_ja ?? '',         en: row.tag_en ?? '' },
        step_number_text: row.step_number_text ?? '',
        title:            { zh: row.title_zh ?? '',       ja: row.title_ja ?? '',       en: row.title_en ?? '' },
        description:      { zh: row.description_zh ?? '', ja: row.description_ja ?? '', en: row.description_en ?? '' },
        price_text:       row.price_text ?? '',
        main_image_url:   row.main_image_url ?? '',
        cta_url:          row.cta_url ?? '',
        is_external:      row.is_external === 1,
        display_order:    row.display_order ?? 0,
        is_enabled:       row.is_enabled === 1,
      },
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[admin/stay-plans/[id] PUT]', err);
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

    await db.query('DELETE FROM stay_plans WHERE id = ?', [id]);
    return NextResponse.json({ success: true }, { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/stay-plans/[id] DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
