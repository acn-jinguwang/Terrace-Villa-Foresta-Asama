import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const OLD_BUCKET = 'terrace-villa-foresta-asama-assets.s3.ap-northeast-1.amazonaws.com';
const NEW_BUCKET = 'terrace-villa-foresta-asama-prod.s3.ap-northeast-1.amazonaws.com';

export async function GET() {
  try {
    const db = getDb();

    // Update media table URLs
    const [mediaResult] = await db.query(
      `UPDATE media SET url = REPLACE(url, ?, ?) WHERE url LIKE ?`,
      [OLD_BUCKET, NEW_BUCKET, `%${OLD_BUCKET}%`],
    ) as any[];

    // Update page_layouts image_urls (JSON column)
    const [layoutResult] = await db.query(
      `UPDATE page_layouts SET image_urls = REPLACE(CAST(image_urls AS CHAR), ?, ?) WHERE CAST(image_urls AS CHAR) LIKE ?`,
      [OLD_BUCKET, NEW_BUCKET, `%${OLD_BUCKET}%`],
    ) as any[];

    return NextResponse.json({
      success: true,
      mediaRowsUpdated: mediaResult.affectedRows,
      layoutRowsUpdated: layoutResult.affectedRows,
    });
  } catch (err) {
    console.error('[migrate-s3]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
