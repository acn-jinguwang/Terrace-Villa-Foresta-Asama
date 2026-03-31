import { NextResponse } from 'next/server';
import { getDb, isTestReq } from '@/lib/db';
import { deleteS3 } from '@/lib/s3';

// PATCH /api/media/reorder — body: { order: string[], category: string }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (id !== 'reorder') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const { order, category }: { order: string[]; category: string } = await request.json();
    if (!Array.isArray(order) || !category) {
      return NextResponse.json({ error: 'order and category are required' }, { status: 400 });
    }
    const db = getDb(isTestReq(request));
    await Promise.all(
      order.map((mediaId, idx) =>
        db.query('UPDATE media SET sort_order = ? WHERE id = ? AND category = ?', [idx, mediaId, category]),
      ),
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/media/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = getDb(isTestReq(request));
    const [rows] = await db.query('SELECT s3_key FROM media WHERE id = ?', [id]) as any[][];
    if (!rows.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const s3Key = rows[0].s3_key;
    if (s3Key) {
      try { await deleteS3(s3Key, isTestReq(request)); } catch { /* ignore S3 errors */ }
    }
    await db.query('DELETE FROM media WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// PUT /api/media/[id] — body: { category?, isHero?, name? }
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body: { category?: string; isHero?: boolean; name?: string } =
      await request.json().catch(() => ({}));

    const db     = getDb(isTestReq(request));
    const fields: string[] = [];
    const values: unknown[] = [];

    if (body.category !== undefined) { fields.push('category = ?'); values.push(body.category); }
    if (body.isHero   !== undefined) { fields.push('is_hero = ?');  values.push(body.isHero ? 1 : 0); }
    if (body.name     !== undefined) { fields.push('name = ?');     values.push(body.name); }

    if (!fields.length) {
      // Legacy: set as hero
      fields.push('is_hero = ?'); values.push(1);
    }

    values.push(id);
    await db.query(`UPDATE media SET ${fields.join(', ')} WHERE id = ?`, values);

    const [rows] = await db.query('SELECT * FROM media WHERE id = ?', [id]) as any[][];
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const r = rows[0];
    return NextResponse.json({
      id: r.id, name: r.name, url: r.url, type: r.type,
      category: r.category, size: r.size, uploadDate: r.upload_date,
      isHero: r.is_hero === 1, s3Key: r.s3_key,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
