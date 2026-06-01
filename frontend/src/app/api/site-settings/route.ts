import { NextResponse } from 'next/server';
import { getDb, isTestReq, ensureV3Tables } from '@/lib/db';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  try {
    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const [rows] = await db.query('SELECT * FROM site_settings') as any[][];

    const result: Record<string, any> = {};
    for (const row of rows as any[]) {
      if (row.value_raw !== null && row.value_raw !== undefined) {
        result[row.setting_key] = row.value_raw;
      } else {
        result[row.setting_key] = {
          zh: row.value_zh ?? '',
          ja: row.value_ja ?? '',
          en: row.value_en ?? '',
        };
      }
    }

    return NextResponse.json(result, { headers: NO_CACHE });
  } catch (err) {
    console.error('[site-settings GET]', err);
    return NextResponse.json({}, { headers: NO_CACHE });
  }
}
