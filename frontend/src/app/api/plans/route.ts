import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { normalizeUrl } from '@/lib/s3';

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
  budgetTotalZh: string | null;
  budgetTotalJa: string | null;
  budgetTotalEn: string | null;
}

const CURRENCY_SYMBOL: Record<string, string> = { CNY: '¥', JPY: '¥', USD: '$' };
const DEFAULT_CURRENCY: Record<string, string> = { zh: 'CNY', ja: 'JPY', en: 'USD' };

function calcBudgetTotal(items: any[], lang: 'zh' | 'ja' | 'en'): string | null {
  let total = 0; let hasAny = false; let currency = '';
  for (const item of items) {
    const amount = (item[`amount_${lang}`] ?? '').replace(/[,¥$￥]/g, '');
    const cur = item[`currency_${lang}`] || DEFAULT_CURRENCY[lang];
    const num = parseFloat(amount);
    if (!isNaN(num) && num > 0) { total += num; hasAny = true; currency = cur; }
  }
  if (!hasAny) return null;
  const sym = CURRENCY_SYMBOL[currency] ?? '';
  return `${currency} ${sym}${total.toLocaleString()}`;
}

export function rowToPlan(r: any, budgetItems?: any[]): PlanEntry {
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
    coverImage:   normalizeUrl(r.cover_image ?? ''),
    visible:      r.visible === 1,
    createdAt:    r.created_at,
    budgetTotalZh: budgetItems ? calcBudgetTotal(budgetItems, 'zh') : null,
    budgetTotalJa: budgetItems ? calcBudgetTotal(budgetItems, 'ja') : null,
    budgetTotalEn: budgetItems ? calcBudgetTotal(budgetItems, 'en') : null,
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
    const [[rows], [budgetRows]] = await Promise.all([
      db.query(sql) as Promise<any[][]>,
      db.query('SELECT plan_id, amount_zh, currency_zh, amount_ja, currency_ja, amount_en, currency_en FROM plan_budget_items') as Promise<any[][]>,
    ]);
    const budgetByPlan: Record<string, any[]> = {};
    for (const b of budgetRows) {
      (budgetByPlan[b.plan_id] ??= []).push(b);
    }
    return NextResponse.json(rows.map((r) => rowToPlan(r, budgetByPlan[r.id] ?? [])));
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
    return NextResponse.json(rows.map((r) => rowToPlan(r)));
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
