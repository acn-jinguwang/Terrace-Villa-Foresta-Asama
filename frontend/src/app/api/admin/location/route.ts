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

function rowToLocation(l: any, access: any[]) {
  return {
    eyebrow:       { zh: l.eyebrow_zh ?? '',     ja: l.eyebrow_ja ?? '',     en: l.eyebrow_en ?? '' },
    title:         { zh: l.title_zh ?? '',       ja: l.title_ja ?? '',       en: l.title_en ?? '' },
    description:   { zh: l.description_zh ?? '', ja: l.description_ja ?? '', en: l.description_en ?? '' },
    address:       { zh: l.address_zh ?? '',     ja: l.address_ja ?? '',     en: l.address_en ?? '' },
    map_image_url: l.map_image_url ?? '',
    access: access.map((a) => ({
      id:           a.id,
      origin:       { zh: a.origin_zh ?? '',   ja: a.origin_ja ?? '',   en: a.origin_en ?? '' },
      duration:     { zh: a.duration_zh ?? '', ja: a.duration_ja ?? '', en: a.duration_en ?? '' },
      display_order: a.display_order ?? 0,
      is_enabled:   a.is_enabled === 1,
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

    const [[loc]] = await db.query('SELECT * FROM location_section WHERE id = 1') as any[][];
    const [access] = await db.query('SELECT * FROM location_access ORDER BY display_order ASC') as any[][];

    return NextResponse.json(rowToLocation(loc ?? {}, access as any[]), { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/location GET]', err);
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
      `INSERT INTO location_section
         (id, eyebrow_zh, eyebrow_ja, eyebrow_en,
          title_zh, title_ja, title_en,
          description_zh, description_ja, description_en,
          address_zh, address_ja, address_en, map_image_url)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         eyebrow_zh = VALUES(eyebrow_zh), eyebrow_ja = VALUES(eyebrow_ja), eyebrow_en = VALUES(eyebrow_en),
         title_zh = VALUES(title_zh), title_ja = VALUES(title_ja), title_en = VALUES(title_en),
         description_zh = VALUES(description_zh), description_ja = VALUES(description_ja), description_en = VALUES(description_en),
         address_zh = VALUES(address_zh), address_ja = VALUES(address_ja), address_en = VALUES(address_en),
         map_image_url = VALUES(map_image_url)`,
      [
        b.eyebrow_zh ?? '',     b.eyebrow_ja ?? '',     b.eyebrow_en ?? '',
        b.title_zh ?? '',       b.title_ja ?? '',       b.title_en ?? '',
        b.description_zh ?? '', b.description_ja ?? '', b.description_en ?? '',
        b.address_zh ?? '',     b.address_ja ?? '',     b.address_en ?? '',
        b.map_image_url ?? '',
      ],
    );

    const [[updated]] = await db.query('SELECT * FROM location_section WHERE id = 1') as any[][];
    const [access] = await db.query('SELECT * FROM location_access ORDER BY display_order ASC') as any[][];

    return NextResponse.json(rowToLocation(updated ?? {}, access as any[]), { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/location PUT]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
