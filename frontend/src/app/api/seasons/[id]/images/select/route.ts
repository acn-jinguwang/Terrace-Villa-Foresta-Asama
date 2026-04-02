import { NextResponse } from 'next/server';
import { getDb, isTestReq, ensureSeasonsTables } from '@/lib/db';
import { normalizeUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

// POST /api/seasons/:id/images/select
// Body: { imageUrl: string, isMain?: boolean, altZh?: string, altJa?: string, altEn?: string }
// Registers an existing gallery image to a season spot (no S3 upload)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const isTest = isTestReq(request);
    await ensureSeasonsTables(isTest);
    const db = getDb(isTest);
    const { id } = await params;
    const spotId = Number(id);

    if (!spotId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const { imageUrl, isMain = false, altZh = '', altJa = '', altEn = '' } = await request.json();
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });

    if (isMain) {
      await db.query('UPDATE season_images SET is_main = 0 WHERE season_id = ?', [spotId]);
    }

    const [maxRow] = await db.query(
      'SELECT COALESCE(MAX(display_order), 0) AS mx FROM season_images WHERE season_id = ?',
      [spotId],
    ) as any[][];
    const nextOrder = (maxRow[0]?.mx ?? 0) + 1;

    await db.query(
      `INSERT INTO season_images (season_id, image_url, s3_key, alt_zh, alt_ja, alt_en, is_main, display_order)
       VALUES (?, ?, '', ?, ?, ?, ?, ?)`,
      [spotId, imageUrl, altZh, altJa, altEn, isMain ? 1 : 0, nextOrder],
    );

    // Return updated spot
    const [spotRows] = await db.query('SELECT * FROM seasons WHERE id = ?', [spotId]) as any[][];
    const [imgRows]  = await db.query(
      'SELECT * FROM season_images WHERE season_id = ? ORDER BY display_order ASC',
      [spotId],
    ) as any[][];

    const images = (imgRows as any[]).map((img) => ({
      id: img.id, imageUrl: normalizeUrl(img.image_url ?? ''), s3Key: img.s3_key ?? '',
      altZh: img.alt_zh ?? '', altJa: img.alt_ja ?? '', altEn: img.alt_en ?? '',
      isMain: img.is_main === 1, displayOrder: img.display_order ?? 0,
    }));

    return NextResponse.json({ ...spotRows[0], images }, { status: 201, headers: NO_CACHE });
  } catch (err) {
    console.error('[season images select]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
