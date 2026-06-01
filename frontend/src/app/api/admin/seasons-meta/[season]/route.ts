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
  { params }: { params: Promise<{ season: string }> },
) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { season } = await params;
    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const b = await request.json();

    await db.query(
      `INSERT INTO seasons_meta
         (season, jp_label, en_label, sub_zh, sub_ja, sub_en,
          caption_zh, caption_ja, caption_en, main_image_url, display_order, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         jp_label = VALUES(jp_label), en_label = VALUES(en_label),
         sub_zh = VALUES(sub_zh), sub_ja = VALUES(sub_ja), sub_en = VALUES(sub_en),
         caption_zh = VALUES(caption_zh), caption_ja = VALUES(caption_ja), caption_en = VALUES(caption_en),
         main_image_url = VALUES(main_image_url), display_order = VALUES(display_order), is_enabled = VALUES(is_enabled)`,
      [
        season,
        b.jp_label ?? '', b.en_label ?? '',
        b.sub_zh ?? '',     b.sub_ja ?? '',     b.sub_en ?? '',
        b.caption_zh ?? '', b.caption_ja ?? '', b.caption_en ?? '',
        b.main_image_url ?? '',
        b.display_order ?? 0,
        b.is_enabled !== false ? 1 : 0,
      ],
    );

    const [rows] = await db.query('SELECT * FROM seasons_meta WHERE season = ?', [season]) as any[][];
    const r = (rows as any[])[0];
    if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(
      {
        season:         r.season,
        jp_label:       r.jp_label ?? '',
        en_label:       r.en_label ?? '',
        sub:            { zh: r.sub_zh ?? '',     ja: r.sub_ja ?? '',     en: r.sub_en ?? '' },
        caption:        { zh: r.caption_zh ?? '', ja: r.caption_ja ?? '', en: r.caption_en ?? '' },
        main_image_url: r.main_image_url ?? '',
        display_order:  r.display_order ?? 0,
        is_enabled:     r.is_enabled === 1,
      },
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[admin/seasons-meta/[season] PUT]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
