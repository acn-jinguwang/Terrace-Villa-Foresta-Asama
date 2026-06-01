import { NextResponse } from 'next/server';
import { getDb, isTestReq, ensureV3Tables } from '@/lib/db';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  try {
    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const [[cta]] = await db.query('SELECT * FROM cta_section WHERE id = 1') as any[][];
    const [settingsRows] = await db.query(
      "SELECT value_raw FROM site_settings WHERE setting_key = 'reservation_url'",
    ) as any[][];

    const c = cta ?? {};
    const reservationUrl = (settingsRows as any[])[0]?.value_raw ?? '';
    const primaryUrl = c.primary_url || reservationUrl;

    return NextResponse.json(
      {
        eyebrow:          { zh: c.eyebrow_zh ?? '',          ja: c.eyebrow_ja ?? '',          en: c.eyebrow_en ?? '' },
        title_line1:      { zh: c.title_line1_zh ?? '',      ja: c.title_line1_ja ?? '',      en: c.title_line1_en ?? '' },
        title_line2:      { zh: c.title_line2_zh ?? '',      ja: c.title_line2_ja ?? '',      en: c.title_line2_en ?? '' },
        subtitle:         { zh: c.subtitle_zh ?? '',         ja: c.subtitle_ja ?? '',         en: c.subtitle_en ?? '' },
        primary_label:    { zh: c.primary_label_zh ?? '',    ja: c.primary_label_ja ?? '',    en: c.primary_label_en ?? '' },
        primary_url:      primaryUrl,
        secondary_label:  { zh: c.secondary_label_zh ?? '',  ja: c.secondary_label_ja ?? '',  en: c.secondary_label_en ?? '' },
        secondary_url:    c.secondary_url ?? '',
      },
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[home/cta GET]', err);
    return NextResponse.json({}, { headers: NO_CACHE });
  }
}
