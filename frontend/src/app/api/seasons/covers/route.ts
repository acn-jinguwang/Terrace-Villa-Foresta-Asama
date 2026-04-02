import { NextResponse } from 'next/server';
import { getDb, isTestReq, ensureSeasonCoversTable } from '@/lib/db';
import { normalizeUrl, deleteS3 } from '@/lib/s3';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

type Season = 'spring' | 'summer' | 'autumn' | 'winter';
const ALL_SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter'];

// GET /api/seasons/covers
// Returns { spring: url|null, summer: url|null, autumn: url|null, winter: url|null }
export async function GET(request: Request) {
  try {
    const isTest = isTestReq(request);
    await ensureSeasonCoversTable(isTest);
    const db = getDb(isTest);
    const [rows] = await db.query('SELECT season, image_url, s3_key FROM season_covers') as any[][];

    const result: Record<string, string | null> = {};
    for (const s of ALL_SEASONS) result[s] = null;
    for (const r of rows as any[]) {
      result[r.season] = normalizeUrl(r.image_url ?? '');
    }

    return NextResponse.json(result, { headers: NO_CACHE });
  } catch (err) {
    console.error('[season_covers GET]', err);
    return NextResponse.json({ spring: null, summer: null, autumn: null, winter: null }, { headers: NO_CACHE });
  }
}

// DELETE /api/seasons/covers?season=spring
export async function DELETE(request: Request) {
  try {
    const isTest = isTestReq(request);
    await ensureSeasonCoversTable(isTest);
    const db = getDb(isTest);
    const season = new URL(request.url).searchParams.get('season') as Season | null;

    if (!season || !ALL_SEASONS.includes(season)) {
      return NextResponse.json({ error: 'Invalid season' }, { status: 400 });
    }

    const [rows] = await db.query('SELECT s3_key FROM season_covers WHERE season = ?', [season]) as any[][];
    if ((rows as any[]).length > 0 && rows[0].s3_key) {
      await deleteS3(rows[0].s3_key, isTest).catch(() => {});
    }
    await db.query('DELETE FROM season_covers WHERE season = ?', [season]);

    return NextResponse.json({ ok: true }, { headers: NO_CACHE });
  } catch (err) {
    console.error('[season_covers DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
