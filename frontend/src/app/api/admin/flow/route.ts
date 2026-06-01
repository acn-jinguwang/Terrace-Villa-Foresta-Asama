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

function rowToFlow(s: any, steps: any[]) {
  return {
    eyebrow:  { zh: s.eyebrow_zh ?? '',  ja: s.eyebrow_ja ?? '',  en: s.eyebrow_en ?? '' },
    title:    { zh: s.title_zh ?? '',    ja: s.title_ja ?? '',    en: s.title_en ?? '' },
    subtitle: { zh: s.subtitle_zh ?? '', ja: s.subtitle_ja ?? '', en: s.subtitle_en ?? '' },
    steps: steps.map((step) => ({
      id:          step.id,
      step_number: step.step_number ?? 0,
      step_label:  { zh: step.step_label_zh ?? '', ja: step.step_label_ja ?? '', en: step.step_label_en ?? '' },
      title:       { zh: step.title_zh ?? '',      ja: step.title_ja ?? '',      en: step.title_en ?? '' },
      description: { zh: step.description_zh ?? '', ja: step.description_ja ?? '', en: step.description_en ?? '' },
      cta_label:   { zh: step.cta_label_zh ?? '',  ja: step.cta_label_ja ?? '',  en: step.cta_label_en ?? '' },
      cta_url:     step.cta_url ?? '',
      is_external: step.is_external === 1,
    })),
  };
}

export async function GET(request: Request) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const [[section]] = await db.query('SELECT * FROM flow_section WHERE id = 1') as any[][];
    const [steps] = await db.query('SELECT * FROM flow_steps ORDER BY display_order ASC') as any[][];

    return NextResponse.json(rowToFlow(section ?? {}, steps as any[]), { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/flow GET]', err);
    return NextResponse.json({ error: String(err) }, { status: 500, headers: NO_CACHE });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await checkAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const b = await request.json();

    await db.query(
      `INSERT INTO flow_section (id, eyebrow_zh, eyebrow_ja, eyebrow_en, title_zh, title_ja, title_en, subtitle_zh, subtitle_ja, subtitle_en)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         eyebrow_zh = VALUES(eyebrow_zh), eyebrow_ja = VALUES(eyebrow_ja), eyebrow_en = VALUES(eyebrow_en),
         title_zh = VALUES(title_zh), title_ja = VALUES(title_ja), title_en = VALUES(title_en),
         subtitle_zh = VALUES(subtitle_zh), subtitle_ja = VALUES(subtitle_ja), subtitle_en = VALUES(subtitle_en)`,
      [
        b.eyebrow_zh ?? '', b.eyebrow_ja ?? '', b.eyebrow_en ?? '',
        b.title_zh ?? '',   b.title_ja ?? '',   b.title_en ?? '',
        b.subtitle_zh ?? '', b.subtitle_ja ?? '', b.subtitle_en ?? '',
      ],
    );

    const [[updated]] = await db.query('SELECT * FROM flow_section WHERE id = 1') as any[][];
    const [steps] = await db.query('SELECT * FROM flow_steps ORDER BY display_order ASC') as any[][];

    return NextResponse.json(rowToFlow(updated ?? {}, steps as any[]), { headers: NO_CACHE });
  } catch (err) {
    console.error('[admin/flow PUT]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
