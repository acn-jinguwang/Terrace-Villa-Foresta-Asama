import { NextResponse } from 'next/server';
import { getDb, isTestReq, ensureV3Tables } from '@/lib/db';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  try {
    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const [[loc]] = await db.query('SELECT * FROM location_section WHERE id = 1') as any[][];
    const [access] = await db.query(
      'SELECT * FROM location_access WHERE is_enabled = 1 ORDER BY display_order ASC',
    ) as any[][];

    const l = loc ?? {};
    return NextResponse.json(
      {
        eyebrow:       { zh: l.eyebrow_zh ?? '',     ja: l.eyebrow_ja ?? '',     en: l.eyebrow_en ?? '' },
        title:         { zh: l.title_zh ?? '',       ja: l.title_ja ?? '',       en: l.title_en ?? '' },
        description:   { zh: l.description_zh ?? '', ja: l.description_ja ?? '', en: l.description_en ?? '' },
        address:       { zh: l.address_zh ?? '',     ja: l.address_ja ?? '',     en: l.address_en ?? '' },
        map_image_url: l.map_image_url ?? '',
        access: (access as any[]).map((a) => ({
          id:       a.id,
          origin:   { zh: a.origin_zh ?? '',   ja: a.origin_ja ?? '',   en: a.origin_en ?? '' },
          duration: { zh: a.duration_zh ?? '', ja: a.duration_ja ?? '', en: a.duration_en ?? '' },
        })),
      },
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[home/location GET]', err);
    return NextResponse.json({}, { headers: NO_CACHE });
  }
}
