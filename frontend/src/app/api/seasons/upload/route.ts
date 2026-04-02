import { NextResponse } from 'next/server';
import { getDb, isTestReq, ensureSeasonsTables } from '@/lib/db';
import { putS3 } from '@/lib/s3';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/seasons/upload
// FormData: file (File), seasonId (string), altZh?, altJa?, altEn?, isMain?
export async function POST(request: Request) {
  try {
    const isTest = isTestReq(request);
    await ensureSeasonsTables(isTest);
    const db = getDb(isTest);

    const formData = await request.formData();
    const file     = formData.get('file') as File | null;
    const seasonId = formData.get('seasonId') as string | null;

    if (!file || !file.size) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!seasonId) {
      return NextResponse.json({ error: 'seasonId is required' }, { status: 400 });
    }

    // Verify the season exists
    const [rows] = await db.query('SELECT id FROM seasons WHERE id = ?', [seasonId]) as any[][];
    if (!(rows as any[]).length) {
      return NextResponse.json({ error: 'Season spot not found' }, { status: 404 });
    }

    const altZh  = (formData.get('altZh')  as string | null) ?? '';
    const altJa  = (formData.get('altJa')  as string | null) ?? '';
    const altEn  = (formData.get('altEn')  as string | null) ?? '';
    const isMain = formData.get('isMain') === 'true';

    const buffer    = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const safeName  = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const s3Key     = `uploads/seasons/${timestamp}-${safeName}`;

    const imageUrl = await putS3(s3Key, buffer, file.type || 'image/jpeg', isTest);

    // If this image is set as main, clear existing main flags for this season
    if (isMain) {
      await db.query('UPDATE season_images SET is_main = 0 WHERE season_id = ?', [seasonId]);
    }

    // Get current max display_order
    const [orderRows] = await db.query(
      'SELECT COALESCE(MAX(display_order), -1) AS maxOrder FROM season_images WHERE season_id = ?',
      [seasonId],
    ) as any[][];
    const nextOrder = (orderRows as any[])[0].maxOrder + 1;

    const [result] = await db.query(
      `INSERT INTO season_images (season_id, image_url, s3_key, alt_zh, alt_ja, alt_en, is_main, display_order)
       VALUES (?,?,?,?,?,?,?,?)`,
      [seasonId, imageUrl, s3Key, altZh, altJa, altEn, isMain ? 1 : 0, nextOrder],
    ) as any[];

    return NextResponse.json({
      id:           result.insertId,
      seasonId:     Number(seasonId),
      imageUrl,
      s3Key,
      altZh, altJa, altEn,
      isMain,
      displayOrder: nextOrder,
    }, { status: 201 });
  } catch (err) {
    console.error('[seasons/upload POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
