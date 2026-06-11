import { NextResponse } from 'next/server';
import { getDb, isTestReq, ensureSeasonCoversTable } from '@/lib/db';
import { putS3, deleteS3 } from '@/lib/s3';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const NO_CACHE = { 'Cache-Control': 'no-store' };

type Season = 'spring' | 'summer' | 'autumn' | 'winter';
const ALL_SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

// POST /api/seasons/covers/upload
// FormData: file (File), season ('spring'|'summer'|'autumn'|'winter')
export async function POST(request: Request) {
  try {
    const isTest = isTestReq(request);
    await ensureSeasonCoversTable(isTest);
    const db = getDb(isTest);

    const formData = await request.formData();
    const file     = formData.get('file') as File | null;
    const season   = formData.get('season') as Season | null;

    if (!file || !file.size) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }
    if (!season || !ALL_SEASONS.includes(season)) {
      return NextResponse.json({ error: 'season is required (spring/summer/autumn/winter)' }, { status: 400 });
    }

    // Delete existing cover image from S3 if present
    const [existing] = await db.query('SELECT s3_key FROM season_covers WHERE season = ?', [season]) as any[][];
    if ((existing as any[]).length > 0 && existing[0].s3_key) {
      await deleteS3(existing[0].s3_key, isTest).catch(() => {});
    }

    // Upload new image
    const buffer   = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const s3Key    = `uploads/season-covers/${season}-${Date.now()}-${safeName}`;
    const imageUrl = await putS3(s3Key, buffer, file.type || 'image/jpeg', isTest);

    // Upsert season_covers row
    await db.query(
      `INSERT INTO season_covers (season, image_url, s3_key)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE image_url = VALUES(image_url), s3_key = VALUES(s3_key)`,
      [season, imageUrl, s3Key],
    );

    return NextResponse.json({ season, imageUrl }, { status: 201, headers: NO_CACHE });
  } catch (err) {
    console.error('[season_covers upload]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
