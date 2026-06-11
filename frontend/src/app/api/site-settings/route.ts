import { NextResponse } from 'next/server';
import { getDb, isTestReq, ensureSiteSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  try {
    const isTest = isTestReq(request);
    await ensureSiteSettings(isTest);
    const db = getDb(isTest);
    const [rows] = await db.query(
      "SELECT value_raw FROM site_settings WHERE setting_key = 'default_theme'",
    ) as any[][];
    const theme = (rows as any[])[0]?.value_raw || 'onyx';
    return NextResponse.json({ default_theme: theme }, { headers: NO_CACHE });
  } catch {
    return NextResponse.json({ default_theme: 'onyx' }, { headers: NO_CACHE });
  }
}
