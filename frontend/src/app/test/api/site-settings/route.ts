import { NextResponse } from 'next/server';
import { getDb, ensureSiteSettings } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureSiteSettings(true);
    const db = getDb(true);
    const [rows] = await db.query(
      "SELECT value_raw FROM site_settings WHERE setting_key = 'default_theme'",
    ) as any[][];
    const theme = (rows as any[])[0]?.value_raw || 'onyx';
    return NextResponse.json({ default_theme: theme }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ default_theme: 'onyx' }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
