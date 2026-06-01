import { NextResponse } from 'next/server';
import { getDb, isTestReq, ensureV3Tables } from '@/lib/db';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  try {
    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const [[section]] = await db.query('SELECT * FROM flow_section WHERE id = 1') as any[][];
    const [steps] = await db.query(
      'SELECT * FROM flow_steps WHERE is_enabled = 1 ORDER BY display_order ASC',
    ) as any[][];

    const s = section ?? {};
    return NextResponse.json(
      {
        eyebrow:  { zh: s.eyebrow_zh ?? '',  ja: s.eyebrow_ja ?? '',  en: s.eyebrow_en ?? '' },
        title:    { zh: s.title_zh ?? '',    ja: s.title_ja ?? '',    en: s.title_en ?? '' },
        subtitle: { zh: s.subtitle_zh ?? '', ja: s.subtitle_ja ?? '', en: s.subtitle_en ?? '' },
        steps: (steps as any[]).map((step) => ({
          id:           step.id,
          step_number:  step.step_number ?? 0,
          step_label:   { zh: step.step_label_zh ?? '', ja: step.step_label_ja ?? '', en: step.step_label_en ?? '' },
          title:        { zh: step.title_zh ?? '',      ja: step.title_ja ?? '',      en: step.title_en ?? '' },
          description:  { zh: step.description_zh ?? '', ja: step.description_ja ?? '', en: step.description_en ?? '' },
          cta_label:    { zh: step.cta_label_zh ?? '',  ja: step.cta_label_ja ?? '',  en: step.cta_label_en ?? '' },
          cta_url:      step.cta_url ?? '',
          is_external:  step.is_external === 1,
        })),
      },
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[home/flow GET]', err);
    return NextResponse.json({}, { headers: NO_CACHE });
  }
}
