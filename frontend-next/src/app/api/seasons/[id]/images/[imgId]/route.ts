import { NextResponse } from 'next/server';
import { getDb, isTestReq, ensureSeasonsTables } from '@/lib/db';
import { deleteS3 } from '@/lib/s3';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

// PUT /api/seasons/:id/images/:imgId — set as main or update alt text
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; imgId: string }> },
) {
  try {
    const { id, imgId } = await params;
    const isTest = isTestReq(request);
    await ensureSeasonsTables(isTest);
    const db = getDb(isTest);
    const b = await request.json();

    if (b.isMain === true) {
      // Clear existing main, then set this one
      await db.query('UPDATE season_images SET is_main = 0 WHERE season_id = ?', [id]);
      await db.query('UPDATE season_images SET is_main = 1 WHERE id = ? AND season_id = ?', [imgId, id]);
    }

    if (b.altZh !== undefined || b.altJa !== undefined || b.altEn !== undefined) {
      await db.query(
        'UPDATE season_images SET alt_zh = ?, alt_ja = ?, alt_en = ? WHERE id = ? AND season_id = ?',
        [b.altZh ?? '', b.altJa ?? '', b.altEn ?? '', imgId, id],
      );
    }

    return NextResponse.json({ ok: true }, { headers: NO_CACHE });
  } catch (err) {
    console.error('[seasons/:id/images/:imgId PUT]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/seasons/:id/images/:imgId
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; imgId: string }> },
) {
  try {
    const { id, imgId } = await params;
    const isTest = isTestReq(request);
    await ensureSeasonsTables(isTest);
    const db = getDb(isTest);

    const [rows] = await db.query(
      'SELECT s3_key FROM season_images WHERE id = ? AND season_id = ?',
      [imgId, id],
    ) as any[][];

    if ((rows as any[]).length && (rows as any[])[0].s3_key) {
      await deleteS3((rows as any[])[0].s3_key, isTest).catch(() => {});
    }

    await db.query('DELETE FROM season_images WHERE id = ? AND season_id = ?', [imgId, id]);

    return NextResponse.json({ ok: true }, { headers: NO_CACHE });
  } catch (err) {
    console.error('[seasons/:id/images/:imgId DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
