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

function rowToCta(c: any, reservationUrl: string) {
  return {
    eyebrow:         { zh: c.eyebrow_zh ?? '',          ja: c.eyebrow_ja ?? '',          en: c.eyebrow_en ?? '' },
    title_line1:     { zh: c.title_line1_zh ?? '',      ja: c.title_line1_ja ?? '',      en: c.title_line1_en ?? '' },
    title_line2:     { zh: c.title_line2_zh ?? '',      ja: c.title_line2_ja ?? '',      en: c.title_line2_en ?? '' },
    subtitle:        { zh: c.subtitle_zh ?? '',         ja: c.subtitle_ja ?? '',         en: c.subtitle_en ?? '' },
    primary_label:   { zh: c.primary_label_zh ?? '',    ja: c.primary_label_ja ?? '',    en: c.primary_label_en ?? '' },
    primary_url:     c.primary_url || reservationUrl,
    secondary_label: { zh: c.secondary_label_zh ?? '',  ja: c.secondary_label_ja ?? '',  en: c.secondary_label_en ?? '' },
    secondary_url:   c.secondary_url ?? '',
  };
}

export async function GET(request: Request) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const [[cta]] = await db.query('SELECT * FROM cta_section WHERE id = 1') as any[][];
    const [settingsRows] = await db.query(
      "SELECT value_raw FROM site_settings WHERE setting_key = 'reservation_url'",
    ) as any[][];
    const reservationUrl = (settingsRows as any[])[0]?.value_raw ?? '';

    return NextResponse.json(rowToCta(cta ?? {}, reservationUrl), { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/cta GET]', err);
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
      `INSERT INTO cta_section
         (id, eyebrow_zh, eyebrow_ja, eyebrow_en,
          title_line1_zh, title_line1_ja, title_line1_en,
          title_line2_zh, title_line2_ja, title_line2_en,
          subtitle_zh, subtitle_ja, subtitle_en,
          primary_label_zh, primary_label_ja, primary_label_en, primary_url,
          secondary_label_zh, secondary_label_ja, secondary_label_en, secondary_url)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         eyebrow_zh = VALUES(eyebrow_zh), eyebrow_ja = VALUES(eyebrow_ja), eyebrow_en = VALUES(eyebrow_en),
         title_line1_zh = VALUES(title_line1_zh), title_line1_ja = VALUES(title_line1_ja), title_line1_en = VALUES(title_line1_en),
         title_line2_zh = VALUES(title_line2_zh), title_line2_ja = VALUES(title_line2_ja), title_line2_en = VALUES(title_line2_en),
         subtitle_zh = VALUES(subtitle_zh), subtitle_ja = VALUES(subtitle_ja), subtitle_en = VALUES(subtitle_en),
         primary_label_zh = VALUES(primary_label_zh), primary_label_ja = VALUES(primary_label_ja), primary_label_en = VALUES(primary_label_en),
         primary_url = VALUES(primary_url),
         secondary_label_zh = VALUES(secondary_label_zh), secondary_label_ja = VALUES(secondary_label_ja), secondary_label_en = VALUES(secondary_label_en),
         secondary_url = VALUES(secondary_url)`,
      [
        b.eyebrow_zh ?? '',       b.eyebrow_ja ?? '',       b.eyebrow_en ?? '',
        b.title_line1_zh ?? '',   b.title_line1_ja ?? '',   b.title_line1_en ?? '',
        b.title_line2_zh ?? '',   b.title_line2_ja ?? '',   b.title_line2_en ?? '',
        b.subtitle_zh ?? '',      b.subtitle_ja ?? '',      b.subtitle_en ?? '',
        b.primary_label_zh ?? '',  b.primary_label_ja ?? '',  b.primary_label_en ?? '',
        b.primary_url ?? '',
        b.secondary_label_zh ?? '', b.secondary_label_ja ?? '', b.secondary_label_en ?? '',
        b.secondary_url ?? '',
      ],
    );

    const [[updated]] = await db.query('SELECT * FROM cta_section WHERE id = 1') as any[][];
    const [settingsRows] = await db.query(
      "SELECT value_raw FROM site_settings WHERE setting_key = 'reservation_url'",
    ) as any[][];
    const reservationUrl = (settingsRows as any[])[0]?.value_raw ?? '';

    return NextResponse.json(rowToCta(updated ?? {}, reservationUrl), { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/cta PUT]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
