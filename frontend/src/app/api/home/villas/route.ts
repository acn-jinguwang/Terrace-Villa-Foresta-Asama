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
      'SELECT * FROM villas WHERE is_enabled = 1 ORDER BY display_order ASC',
    ) as any[][];

    return NextResponse.json(
      (rows as any[]).map((v) => ({
        id:              v.id,
        villa_key:       v.villa_key ?? '',
        name:            { zh: v.name_zh ?? '',        ja: v.name_ja ?? '',        en: v.name_en ?? '' },
        spec:            { zh: v.spec_zh ?? '',        ja: v.spec_ja ?? '',        en: v.spec_en ?? '' },
        tag:             { zh: v.tag_zh ?? '',         ja: v.tag_ja ?? '',         en: v.tag_en ?? '' },
        description:     { zh: v.description_zh ?? '', ja: v.description_ja ?? '', en: v.description_en ?? '' },
        main_image_url:  v.main_image_url ?? '',
      })),
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[home/villas GET]', err);
    return NextResponse.json([], { headers: NO_CACHE });
  }
}
