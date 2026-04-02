import { NextResponse } from 'next/server';
import { getDb, isTestReq, ensureSeasonsTables } from '@/lib/db';
import { normalizeUrl, deleteS3 } from '@/lib/s3';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

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

// GET /api/seasons/:id
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const isTest = isTestReq(request);
    await ensureSeasonsTables(isTest);
    const db = getDb(isTest);

    const [rows] = await db.query('SELECT * FROM seasons WHERE id = ?', [id]) as any[][];
    if (!(rows as any[]).length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const [images] = await db.query(
      'SELECT * FROM season_images WHERE season_id = ? ORDER BY display_order ASC',
      [id],
    ) as any[][];

    return NextResponse.json(rowToSpot(rows[0], images as any[]), { headers: NO_CACHE });
  } catch (err) {
    console.error('[seasons/:id GET]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PUT /api/seasons/:id — update spot
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const isTest = isTestReq(request);
    await ensureSeasonsTables(isTest);
    const db = getDb(isTest);
    const b = await request.json();

    await db.query(
      `UPDATE seasons SET
         season        = COALESCE(?, season),
         name_zh       = ?,
         name_ja       = ?,
         name_en       = ?,
         desc_zh       = ?,
         desc_ja       = ?,
         desc_en       = ?,
         access_zh     = ?,
         access_ja     = ?,
         access_en     = ?,
         distance_min  = ?,
         is_featured   = ?,
         display_order = ?,
         is_active     = ?
       WHERE id = ?`,
      [
        b.season ?? null,
        b.nameZh ?? '', b.nameJa ?? '', b.nameEn ?? '',
        b.descZh ?? '', b.descJa ?? '', b.descEn ?? '',
        b.accessZh ?? '', b.accessJa ?? '', b.accessEn ?? '',
        b.distanceMin ?? 0,
        b.isFeatured ? 1 : 0,
        b.displayOrder ?? 0,
        b.isActive !== false ? 1 : 0,
        id,
      ],
    );

    const [rows] = await db.query('SELECT * FROM seasons WHERE id = ?', [id]) as any[][];
    if (!(rows as any[]).length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const [images] = await db.query(
      'SELECT * FROM season_images WHERE season_id = ? ORDER BY display_order ASC',
      [id],
    ) as any[][];

    return NextResponse.json(rowToSpot(rows[0], images as any[]), { headers: NO_CACHE });
  } catch (err) {
    console.error('[seasons/:id PUT]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/seasons/:id — delete spot and its images from S3 + DB
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const isTest = isTestReq(request);
    await ensureSeasonsTables(isTest);
    const db = getDb(isTest);

    // Fetch images to delete from S3
    const [images] = await db.query(
      'SELECT s3_key FROM season_images WHERE season_id = ?',
      [id],
    ) as any[][];

    // Delete from S3 (best effort)
    for (const img of images as any[]) {
      if (img.s3_key) {
        await deleteS3(img.s3_key, isTest).catch(() => {});
      }
    }

    // Delete from DB (season_images via CASCADE INDEX, seasons row)
    await db.query('DELETE FROM season_images WHERE season_id = ?', [id]);
    await db.query('DELETE FROM seasons WHERE id = ?', [id]);

    return NextResponse.json({ ok: true }, { headers: NO_CACHE });
  } catch (err) {
    console.error('[seasons/:id DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
