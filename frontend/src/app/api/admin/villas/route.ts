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

function rowToVilla(v: any) {
  return {
    id:             v.id,
    villa_key:      v.villa_key ?? '',
    name:           { zh: v.name_zh ?? '',        ja: v.name_ja ?? '',        en: v.name_en ?? '' },
    spec:           { zh: v.spec_zh ?? '',        ja: v.spec_ja ?? '',        en: v.spec_en ?? '' },
    tag:            { zh: v.tag_zh ?? '',         ja: v.tag_ja ?? '',         en: v.tag_en ?? '' },
    description:    { zh: v.description_zh ?? '', ja: v.description_ja ?? '', en: v.description_en ?? '' },
    main_image_url: v.main_image_url ?? '',
    display_order:  v.display_order ?? 0,
    is_enabled:     v.is_enabled === 1,
  };
}

export async function GET(request: Request) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const [rows] = await db.query('SELECT * FROM villas ORDER BY display_order ASC') as any[][];
    return NextResponse.json((rows as any[]).map(rowToVilla), { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/villas GET]', err);
    return NextResponse.json({ error: String(err) }, { status: 500, headers: NO_CACHE });
  }
}

export async function POST(request: Request) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const b = await request.json();

    const [result] = await db.query(
      `INSERT INTO villas
         (villa_key, name_zh, name_ja, name_en, spec_zh, spec_ja, spec_en,
          tag_zh, tag_ja, tag_en, description_zh, description_ja, description_en,
          main_image_url, display_order, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        b.villa_key ?? '',
        b.name_zh ?? '', b.name_ja ?? '', b.name_en ?? '',
        b.spec_zh ?? '',  b.spec_ja ?? '',  b.spec_en ?? '',
        b.tag_zh ?? '',   b.tag_ja ?? '',   b.tag_en ?? '',
        b.description_zh ?? '', b.description_ja ?? '', b.description_en ?? '',
        b.main_image_url ?? '',
        b.display_order ?? 0,
      ],
    ) as any[];

    const [rows] = await db.query('SELECT * FROM villas WHERE id = ?', [result.insertId]) as any[][];
    return NextResponse.json(rowToVilla((rows as any[])[0]), { status: 201, headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/villas POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
