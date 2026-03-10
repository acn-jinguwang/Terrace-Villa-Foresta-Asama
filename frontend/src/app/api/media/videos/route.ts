import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const [rows] = await db.query(
      'SELECT * FROM media WHERE type = ? ORDER BY sort_order ASC, created_at DESC',
      ['video'],
    ) as any[][];

    return NextResponse.json(rows.map((r: any) => ({
      id:         r.id,
      name:       r.name,
      url:        r.url,
      type:       r.type,
      category:   r.category,
      size:       r.size,
      uploadDate: r.upload_date,
      isHero:     r.is_hero === 1,
      s3Key:      r.s3_key,
    })));
  } catch (err) {
    console.error('[media/videos]', err);
    return NextResponse.json([]);
  }
}
