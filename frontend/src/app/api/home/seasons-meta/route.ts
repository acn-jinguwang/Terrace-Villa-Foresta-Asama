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
      'SELECT * FROM seasons_meta WHERE is_enabled = 1 ORDER BY display_order ASC',
    ) as any[][];

    return NextResponse.json(
      (rows as any[]).map((r) => ({
        season:         r.season,
        jp_label:       r.jp_label ?? '',
        en_label:       r.en_label ?? '',
        sub:            { zh: r.sub_zh ?? '',     ja: r.sub_ja ?? '',     en: r.sub_en ?? '' },
        caption:        { zh: r.caption_zh ?? '', ja: r.caption_ja ?? '', en: r.caption_en ?? '' },
        main_image_url: r.main_image_url ?? '',
      })),
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[home/seasons-meta GET]', err);
    return NextResponse.json([], { headers: NO_CACHE });
  }
}
