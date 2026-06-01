import { NextResponse } from 'next/server';
import { getDb, isTestReq, ensureV3Tables } from '@/lib/db';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  try {
    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const [rows] = await db.query(
      'SELECT * FROM stay_plans WHERE is_enabled = 1 ORDER BY display_order ASC',
    ) as any[][];

    return NextResponse.json(
      (rows as any[]).map((p) => ({
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
      })),
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[home/plans GET]', err);
    return NextResponse.json([], { headers: NO_CACHE });
  }
}
