import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb, isTestReq, ensureSiteSettings } from '@/lib/db';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

async function checkAuth() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? await verifySessionToken(token) : null;
}

export async function GET(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const isTest = isTestReq(request);
  await ensureSiteSettings(isTest);
  const db = getDb(isTest);
  const [rows] = await db.query('SELECT * FROM site_settings') as any[][];
  const settings: Record<string, string> = {};
  for (const r of rows as any[]) settings[r.setting_key] = r.value_raw;
  return NextResponse.json(settings, { headers: NO_CACHE });
}

export async function PUT(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const isTest = isTestReq(request);
  await ensureSiteSettings(isTest);
  const db = getDb(isTest);
  const body = await request.json();
  const valid = ['onyx', 'forest', 'mist'];
  if (body.default_theme && valid.includes(body.default_theme)) {
    await db.query(
      "REPLACE INTO site_settings (setting_key, value_raw) VALUES ('default_theme', ?)",
      [body.default_theme],
    );
  }
  return NextResponse.json({ ok: true }, { headers: NO_CACHE });
}
