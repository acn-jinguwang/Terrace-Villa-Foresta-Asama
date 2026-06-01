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

function rowToHero(h: any, stats: any[]) {
  return {
    background_image_url: h.background_image_url ?? '',
    eyebrow:     { zh: h.eyebrow_zh ?? '',     ja: h.eyebrow_ja ?? '',     en: h.eyebrow_en ?? '' },
    title_line1: { zh: h.title_line1_zh ?? '',  ja: h.title_line1_ja ?? '',  en: h.title_line1_en ?? '' },
    title_line2: { zh: h.title_line2_zh ?? '',  ja: h.title_line2_ja ?? '',  en: h.title_line2_en ?? '' },
    subtitle:    { zh: h.subtitle_zh ?? '',     ja: h.subtitle_ja ?? '',     en: h.subtitle_en ?? '' },
    stats: stats.map((s) => ({
      id:            s.id,
      value_text:    s.value_text ?? '',
      label:         { zh: s.label_zh ?? '', ja: s.label_ja ?? '', en: s.label_en ?? '' },
      display_order: s.display_order ?? 0,
    })),
  };
}

export async function GET(request: Request) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const [[hero]] = await db.query('SELECT * FROM hero_section WHERE id = 1') as any[][];
    const [stats] = await db.query('SELECT * FROM hero_stats WHERE is_enabled = 1 ORDER BY display_order ASC') as any[][];

    return NextResponse.json(rowToHero(hero ?? {}, stats as any[]), { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/hero GET]', err);
    return NextResponse.json({ error: String(err) }, { status: 500, headers: NO_CACHE });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const b = await request.json();

    await db.query(
      `INSERT INTO hero_section
         (id, background_image_url, eyebrow_zh, eyebrow_ja, eyebrow_en,
          title_line1_zh, title_line1_ja, title_line1_en,
          title_line2_zh, title_line2_ja, title_line2_en,
          subtitle_zh, subtitle_ja, subtitle_en)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         background_image_url = VALUES(background_image_url),
         eyebrow_zh = VALUES(eyebrow_zh), eyebrow_ja = VALUES(eyebrow_ja), eyebrow_en = VALUES(eyebrow_en),
         title_line1_zh = VALUES(title_line1_zh), title_line1_ja = VALUES(title_line1_ja), title_line1_en = VALUES(title_line1_en),
         title_line2_zh = VALUES(title_line2_zh), title_line2_ja = VALUES(title_line2_ja), title_line2_en = VALUES(title_line2_en),
         subtitle_zh = VALUES(subtitle_zh), subtitle_ja = VALUES(subtitle_ja), subtitle_en = VALUES(subtitle_en)`,
      [
        b.background_image_url ?? '',
        b.eyebrow_zh ?? '', b.eyebrow_ja ?? '', b.eyebrow_en ?? '',
        b.title_line1_zh ?? '', b.title_line1_ja ?? '', b.title_line1_en ?? '',
        b.title_line2_zh ?? '', b.title_line2_ja ?? '', b.title_line2_en ?? '',
        b.subtitle_zh ?? '', b.subtitle_ja ?? '', b.subtitle_en ?? '',
      ],
    );

    const [[updated]] = await db.query('SELECT * FROM hero_section WHERE id = 1') as any[][];
    const [stats] = await db.query('SELECT * FROM hero_stats WHERE is_enabled = 1 ORDER BY display_order ASC') as any[][];

    return NextResponse.json(rowToHero(updated ?? {}, stats as any[]), { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/hero PUT]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
