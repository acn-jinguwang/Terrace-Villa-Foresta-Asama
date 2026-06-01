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

export async function GET(request: Request) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const [rows] = await db.query('SELECT * FROM seasons_meta ORDER BY display_order ASC') as any[][];

    return NextResponse.json(
      (rows as any[]).map((r) => ({
        season:         r.season,
        jp_label:       r.jp_label ?? '',
        en_label:       r.en_label ?? '',
        sub:            { zh: r.sub_zh ?? '',     ja: r.sub_ja ?? '',     en: r.sub_en ?? '' },
        caption:        { zh: r.caption_zh ?? '', ja: r.caption_ja ?? '', en: r.caption_en ?? '' },
        main_image_url: r.main_image_url ?? '',
        display_order:  r.display_order ?? 0,
        is_enabled:     r.is_enabled === 1,
      })),
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[admin/seasons-meta GET]', err);
    return NextResponse.json({ error: String(err) }, { status: 500, headers: NO_CACHE });
  }
}
