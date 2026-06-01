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

function rowToPlan(p: any) {
  return {
    id:               p.id,
    plan_key:         p.plan_key ?? '',
    tag:              { zh: p.tag_zh ?? '',         ja: p.tag_ja ?? '',         en: p.tag_en ?? '' },
    step_number_text: p.step_number_text ?? '',
    title:            { zh: p.title_zh ?? '',       ja: p.title_ja ?? '',       en: p.title_en ?? '' },
    description:      { zh: p.description_zh ?? '', ja: p.description_ja ?? '', en: p.description_en ?? '' },
    price_text:       p.price_text ?? '',
    main_image_url:   p.main_image_url ?? '',
    cta_url:          p.cta_url ?? '',
    is_external:      p.is_external === 1,
    display_order:    p.display_order ?? 0,
    is_enabled:       p.is_enabled === 1,
  };
}

export async function GET(request: Request) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const [rows] = await db.query('SELECT * FROM stay_plans ORDER BY display_order ASC') as any[][];
    return NextResponse.json((rows as any[]).map(rowToPlan), { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/stay-plans GET]', err);
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
      `INSERT INTO stay_plans
         (plan_key, tag_zh, tag_ja, tag_en, step_number_text,
          title_zh, title_ja, title_en,
          description_zh, description_ja, description_en,
          price_text, main_image_url, cta_url, is_external, display_order, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
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
      ],
    ) as any[];

    const [rows] = await db.query('SELECT * FROM stay_plans WHERE id = ?', [result.insertId]) as any[][];
    return NextResponse.json(rowToPlan((rows as any[])[0]), { status: 201, headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/stay-plans POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
