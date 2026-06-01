import { NextResponse } from 'next/server';
import { getDb, isTestReq, ensureV3Tables } from '@/lib/db';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  try {
    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const [[hero]] = await db.query('SELECT * FROM hero_section WHERE id = 1') as any[][];
    const [stats] = await db.query(
      'SELECT * FROM hero_stats WHERE is_enabled = 1 ORDER BY display_order ASC',
    ) as any[][];

    const h = hero ?? {};
    return NextResponse.json(
      {
        background_image_url: h.background_image_url ?? '',
        eyebrow:     { zh: h.eyebrow_zh ?? '',     ja: h.eyebrow_ja ?? '',     en: h.eyebrow_en ?? '' },
        title_line1: { zh: h.title_line1_zh ?? '',  ja: h.title_line1_ja ?? '',  en: h.title_line1_en ?? '' },
        title_line2: { zh: h.title_line2_zh ?? '',  ja: h.title_line2_ja ?? '',  en: h.title_line2_en ?? '' },
        subtitle:    { zh: h.subtitle_zh ?? '',     ja: h.subtitle_ja ?? '',     en: h.subtitle_en ?? '' },
        stats: (stats as any[]).map((s) => ({
          id:            s.id,
          value_text:    s.value_text ?? '',
          label:         { zh: s.label_zh ?? '', ja: s.label_ja ?? '', en: s.label_en ?? '' },
          display_order: s.display_order ?? 0,
        })),
      },
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[home/hero GET]', err);
    return NextResponse.json({}, { headers: NO_CACHE });
  }
}
