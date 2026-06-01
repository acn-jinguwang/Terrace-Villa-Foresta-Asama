import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb, isTestReq, ensureV3Tables } from '@/lib/db';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

async function checkAuth() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? await verifySessionToken(token) : null;
}

function rowToStep(step: any) {
  return {
    id:          step.id,
    step_number: step.step_number ?? 0,
    step_label:  { zh: step.step_label_zh ?? '', ja: step.step_label_ja ?? '', en: step.step_label_en ?? '' },
    title:       { zh: step.title_zh ?? '',      ja: step.title_ja ?? '',      en: step.title_en ?? '' },
    description: { zh: step.description_zh ?? '', ja: step.description_ja ?? '', en: step.description_en ?? '' },
    cta_label:   { zh: step.cta_label_zh ?? '',  ja: step.cta_label_ja ?? '',  en: step.cta_label_en ?? '' },
    cta_url:     step.cta_url ?? '',
    is_external: step.is_external === 1,
    display_order: step.display_order ?? 0,
    is_enabled:  step.is_enabled === 1,
  };
}

export async function GET(request: Request) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const [rows] = await db.query('SELECT * FROM flow_steps ORDER BY display_order ASC') as any[][];
    return NextResponse.json((rows as any[]).map(rowToStep), { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/flow/steps GET]', err);
    return NextResponse.json({ error: String(err) }, { status: 500, headers: NO_CACHE });
  }
}

export async function POST(request: Request) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const b = await request.json();

    const [result] = await db.query(
      `INSERT INTO flow_steps
         (step_number, step_label_zh, step_label_ja, step_label_en,
          title_zh, title_ja, title_en,
          description_zh, description_ja, description_en,
          cta_label_zh, cta_label_ja, cta_label_en,
          cta_url, is_external, display_order, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        b.step_number ?? 0,
        b.step_label_zh ?? '', b.step_label_ja ?? '', b.step_label_en ?? '',
        b.title_zh ?? '',       b.title_ja ?? '',       b.title_en ?? '',
        b.description_zh ?? '', b.description_ja ?? '', b.description_en ?? '',
        b.cta_label_zh ?? '',   b.cta_label_ja ?? '',   b.cta_label_en ?? '',
        b.cta_url ?? '',
        b.is_external ? 1 : 0,
        b.display_order ?? 0,
      ],
    ) as any[];

    const [rows] = await db.query('SELECT * FROM flow_steps WHERE id = ?', [result.insertId]) as any[][];
    return NextResponse.json(rowToStep((rows as any[])[0]), { status: 201, headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/flow/steps POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
