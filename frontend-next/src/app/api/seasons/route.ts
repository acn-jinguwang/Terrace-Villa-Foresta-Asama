import { NextResponse } from 'next/server';
import { getDb, isTestReq, ensureSeasonsTables, seedSeasonsIfEmpty } from '@/lib/db';
import { normalizeUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

function rowToSpot(r: any, images: any[] = []) {
  return {
    id:           r.id,
    season:       r.season,
    nameZh:       r.name_zh      ?? '',
    nameJa:       r.name_ja      ?? '',
    nameEn:       r.name_en      ?? '',
    descZh:       r.desc_zh      ?? '',
    descJa:       r.desc_ja      ?? '',
    descEn:       r.desc_en      ?? '',
    accessZh:     r.access_zh    ?? '',
    accessJa:     r.access_ja    ?? '',
    accessEn:     r.access_en    ?? '',
    distanceMin:  r.distance_min ?? 0,
    isFeatured:   r.is_featured  === 1,
    displayOrder: r.display_order ?? 0,
    isActive:     r.is_active    === 1,
    createdAt:    r.created_at,
    images: images.map((img) => ({
      id:           img.id,
      imageUrl:     normalizeUrl(img.image_url ?? ''),
      s3Key:        img.s3_key   ?? '',
      altZh:        img.alt_zh   ?? '',
      altJa:        img.alt_ja   ?? '',
      altEn:        img.alt_en   ?? '',
      isMain:       img.is_main  === 1,
      displayOrder: img.display_order ?? 0,
    })),
  };
}

// GET /api/seasons?season=winter&public=1
export async function GET(request: Request) {
  try {
    const isTest = isTestReq(request);
    await ensureSeasonsTables(isTest);
    await seedSeasonsIfEmpty(isTest);
    const db = getDb(isTest);
    const { searchParams } = new URL(request.url);
    const season  = searchParams.get('season') as Season | null;
    const isPublic = searchParams.get('public') === '1';

    let sql = 'SELECT * FROM seasons';
    const params: any[] = [];
    const conditions: string[] = [];
    if (isPublic) conditions.push('is_active = 1');
    if (season)   { conditions.push('season = ?'); params.push(season); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY display_order ASC, id ASC';

    const [spots] = await db.query(sql, params) as any[][];

    // Fetch all images for returned spots in one query
    if (spots.length === 0) {
      return NextResponse.json({ spots: [] }, { headers: NO_CACHE });
    }
    const ids = (spots as any[]).map((s) => s.id);
    const [images] = await db.query(
      `SELECT * FROM season_images WHERE season_id IN (${ids.map(() => '?').join(',')}) ORDER BY display_order ASC`,
      ids,
    ) as any[][];

    const imagesBySpot: Record<number, any[]> = {};
    for (const img of images as any[]) {
      (imagesBySpot[img.season_id] ??= []).push(img);
    }

    return NextResponse.json(
      { spots: (spots as any[]).map((s) => rowToSpot(s, imagesBySpot[s.id] ?? [])) },
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[seasons GET]', err);
    return NextResponse.json({ spots: [] }, { headers: NO_CACHE });
  }
}

// POST /api/seasons — create new spot
export async function POST(request: Request) {
  try {
    const isTest = isTestReq(request);
    await ensureSeasonsTables(isTest);
    const db = getDb(isTest);
    const b = await request.json();

    if (!b.season || !['spring','summer','autumn','winter'].includes(b.season)) {
      return NextResponse.json({ error: 'season is required (spring/summer/autumn/winter)' }, { status: 400 });
    }

    const [result] = await db.query(
      `INSERT INTO seasons
         (season, name_zh, name_ja, name_en, desc_zh, desc_ja, desc_en,
          access_zh, access_ja, access_en, distance_min, is_featured, display_order, is_active)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        b.season,
        b.nameZh ?? '', b.nameJa ?? '', b.nameEn ?? '',
        b.descZh ?? '', b.descJa ?? '', b.descEn ?? '',
        b.accessZh ?? '', b.accessJa ?? '', b.accessEn ?? '',
        b.distanceMin ?? 0,
        b.isFeatured ? 1 : 0,
        b.displayOrder ?? 0,
        b.isActive !== false ? 1 : 0,
      ],
    ) as any[];

    const newId = result.insertId;
    const [rows] = await db.query('SELECT * FROM seasons WHERE id = ?', [newId]) as any[][];
    return NextResponse.json(rowToSpot(rows[0], []), { status: 201, headers: NO_CACHE });
  } catch (err) {
    console.error('[seasons POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
