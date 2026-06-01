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

    const [rows] = await db.query('SELECT * FROM site_settings') as any[][];

    const result: Record<string, any> = {};
    for (const row of rows as any[]) {
      if (row.value_raw !== null && row.value_raw !== undefined) {
        result[row.setting_key] = row.value_raw;
      } else {
        result[row.setting_key] = { zh: row.value_zh ?? '', ja: row.value_ja ?? '', en: row.value_en ?? '' };
      }
    }

    return NextResponse.json(result, { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/site-settings GET]', err);
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

    // Scalar keys: value stored in value_raw
    const scalarKeys: Record<string, string | undefined> = {
      reservation_url: b.reservation_url,
      default_theme:   b.default_theme,
    };

    for (const [key, val] of Object.entries(scalarKeys)) {
      if (val !== undefined) {
        await db.query(
          'REPLACE INTO site_settings (setting_key, value_raw, value_zh, value_ja, value_en) VALUES (?, ?, NULL, NULL, NULL)',
          [key, val],
        );
      }
    }

    // Multi-lingual keys: stored in value_zh / value_ja / value_en
    const multiKeys: Array<{ key: string; zh?: string; ja?: string; en?: string }> = [
      { key: 'brand_name',    zh: b.brand_name_zh,    ja: b.brand_name_ja,    en: b.brand_name_en },
      { key: 'brand_tagline', zh: b.brand_tagline_zh, ja: b.brand_tagline_ja, en: b.brand_tagline_en },
    ];

    for (const { key, zh, ja, en } of multiKeys) {
      if (zh !== undefined || ja !== undefined || en !== undefined) {
        // Fetch current values first to preserve untouched languages
        const [existing] = await db.query(
          'SELECT value_zh, value_ja, value_en FROM site_settings WHERE setting_key = ?',
          [key],
        ) as any[][];
        const cur = (existing as any[])[0] ?? {};
        await db.query(
          'REPLACE INTO site_settings (setting_key, value_raw, value_zh, value_ja, value_en) VALUES (?, NULL, ?, ?, ?)',
          [key, zh ?? cur.value_zh ?? '', ja ?? cur.value_ja ?? '', en ?? cur.value_en ?? ''],
        );
      }
    }

    // Return updated settings
    const [rows] = await db.query('SELECT * FROM site_settings') as any[][];
    const result: Record<string, any> = {};
    for (const row of rows as any[]) {
      if (row.value_raw !== null && row.value_raw !== undefined) {
        result[row.setting_key] = row.value_raw;
      } else {
        result[row.setting_key] = { zh: row.value_zh ?? '', ja: row.value_ja ?? '', en: row.value_en ?? '' };
      }
    }

    return NextResponse.json(result, { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/site-settings PUT]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
