import { NextResponse } from 'next/server';
import { getDb, isTestReq, ensureV3Tables } from '@/lib/db';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  try {
    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);
    const [[vsRow]] = await db.query('SELECT * FROM video_section WHERE id = 1') as any[][];
    const [videos] = await db.query(
      'SELECT * FROM featured_videos WHERE is_enabled = 1 ORDER BY display_order ASC',
    ) as any[][];
    const v = vsRow ?? {};
    return NextResponse.json({
      eyebrow:  { zh: v.eyebrow_zh ?? '', ja: v.eyebrow_ja ?? '', en: v.eyebrow_en ?? '' },
      title:    { zh: v.title_zh ?? '',   ja: v.title_ja ?? '',   en: v.title_en ?? '' },
      subtitle: { zh: v.subtitle_zh ?? '',ja: v.subtitle_ja ?? '',en: v.subtitle_en ?? '' },
      videos: (videos as any[]).map(r => ({
        id: r.id,
        title:         { zh: r.title_zh ?? '',       ja: r.title_ja ?? '',       en: r.title_en ?? '' },
        video_url:     r.video_url ?? '',
        thumbnail_url: r.thumbnail_url ?? '',
        description:   { zh: r.description_zh ?? '', ja: r.description_ja ?? '', en: r.description_en ?? '' },
      })),
    }, { headers: NO_CACHE });
  } catch (err) {
    console.error('[home/videos GET]', err);
    return NextResponse.json(
      { eyebrow:{zh:'',ja:'',en:''}, title:{zh:'',ja:'',en:''}, subtitle:{zh:'',ja:'',en:''}, videos: [] },
      { headers: NO_CACHE },
    );
  }
}
