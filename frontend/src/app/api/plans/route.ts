import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export interface PlanEntry {
  id: string;
  titleZh: string; titleJa: string; titleEn: string;
  descZh: string;  descJa: string;  descEn: string;
  duration: number;
  price: string;
  tagZh: string;   tagJa: string;   tagEn: string;
  highlightsZh: string[]; highlightsJa: string[]; highlightsEn: string[];
  coverImage: string;
  visible: boolean;
  createdAt: string;
}

export function rowToPlan(r: any): PlanEntry {
  const j = (v: any) => (typeof v === 'string' ? JSON.parse(v) : v) ?? [];
  return {
    id:           r.id,
    titleZh:      r.title_zh,  titleJa:     r.title_ja,  titleEn:     r.title_en,
    descZh:       r.desc_zh,   descJa:      r.desc_ja,   descEn:      r.desc_en,
    duration:     r.duration,
    price:        r.price,
    tagZh:        r.tag_zh,    tagJa:       r.tag_ja,    tagEn:       r.tag_en,
    highlightsZh: j(r.highlights_zh),
    highlightsJa: j(r.highlights_ja),
    highlightsEn: j(r.highlights_en),
    coverImage:   r.cover_image,
    visible:      r.visible === 1,
    createdAt:    r.created_at,
  };
}

// GET /api/plans
export async function GET(request: Request) {
  try {
    const isPublic = new URL(request.url).searchParams.get('public') === '1';
    const db = getDb();
    const sql = isPublic
      ? 'SELECT * FROM plans WHERE visible = 1 ORDER BY sort_order ASC, created_at ASC'
      : 'SELECT * FROM plans ORDER BY sort_order ASC, created_at ASC';
    const [rows] = await db.query(sql) as any[][];
    return NextResponse.json(rows.map(rowToPlan));
  } catch (err) {
    console.error('[plans GET]', err);
    return NextResponse.json([]);
  }
}

// PATCH /api/plans — reorder
export async function PATCH(request: Request) {
  try {
    const { order }: { order: string[] } = await request.json();
    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'order must be an array of IDs' }, { status: 400 });
    }
    const db = getDb();
    await Promise.all(order.map((id, idx) =>
      db.query('UPDATE plans SET sort_order = ? WHERE id = ?', [idx, id]),
    ));
    const [rows] = await db.query('SELECT * FROM plans ORDER BY sort_order ASC') as any[][];
    return NextResponse.json(rows.map(rowToPlan));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/plans — create
export async function POST(request: Request) {
  try {
    const body: Partial<PlanEntry> = await request.json();
    if (!body.id || !body.titleZh) {
      return NextResponse.json({ error: 'id and titleZh are required' }, { status: 400 });
    }
    const db = getDb();
    const [existing] = await db.query('SELECT id FROM plans WHERE id = ?', [body.id]) as any[][];
    if (existing.length) return NextResponse.json({ error: 'Plan ID already exists' }, { status: 409 });

    await db.query(
      `INSERT INTO plans
       (id, title_zh, title_ja, title_en, desc_zh, desc_ja, desc_en,
        duration, price, tag_zh, tag_ja, tag_en,
        highlights_zh, highlights_ja, highlights_en,
        cover_image, visible, sort_order)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        body.id,
        body.titleZh ?? '', body.titleJa ?? '', body.titleEn ?? '',
        body.descZh  ?? '', body.descJa  ?? '', body.descEn  ?? '',
        body.duration ?? 1,  body.price ?? '',
        body.tagZh ?? '', body.tagJa ?? '', body.tagEn ?? '',
        JSON.stringify(body.highlightsZh ?? []),
        JSON.stringify(body.highlightsJa ?? []),
        JSON.stringify(body.highlightsEn ?? []),
        body.coverImage ?? '',
        body.visible !== false ? 1 : 0,
        0,
      ],
    );
    const [rows] = await db.query('SELECT * FROM plans WHERE id = ?', [body.id]) as any[][];
    return NextResponse.json(rowToPlan(rows[0]), { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
