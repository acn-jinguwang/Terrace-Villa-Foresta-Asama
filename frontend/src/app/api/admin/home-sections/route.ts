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

    const [rows] = await db.query('SELECT * FROM home_sections ORDER BY display_order ASC') as any[][];

    return NextResponse.json(
      (rows as any[]).map((r) => ({
        section_key:   r.section_key,
        display_order: r.display_order ?? 0,
        is_enabled:    r.is_enabled === 1,
      })),
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[admin/home-sections GET]', err);
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

    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Body must be an array' }, { status: 400 });
    }

    for (const item of body) {
      if (!item.section_key) continue;
      await db.query(
        `INSERT INTO home_sections (section_key, display_order, is_enabled)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           display_order = VALUES(display_order),
           is_enabled = VALUES(is_enabled)`,
        [
          item.section_key,
          item.display_order ?? 0,
          item.is_enabled !== false ? 1 : 0,
        ],
      );
    }

    const [rows] = await db.query('SELECT * FROM home_sections ORDER BY display_order ASC') as any[][];
    return NextResponse.json(
      (rows as any[]).map((r) => ({
        section_key:   r.section_key,
        display_order: r.display_order ?? 0,
        is_enabled:    r.is_enabled === 1,
      })),
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[admin/home-sections PUT]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
