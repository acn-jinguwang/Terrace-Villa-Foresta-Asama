import { NextResponse } from 'next/server';
import { getDb, isTestReq, ensureV3Tables } from '@/lib/db';

export const dynamic = 'force-dynamic';
const NO_CACHE = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  try {
    const isTest = isTestReq(request);
    await ensureV3Tables(isTest);
    const db = getDb(isTest);

    const [rows] = await db.query(
      'SELECT * FROM home_sections ORDER BY display_order ASC',
    ) as any[][];

    return NextResponse.json(
      {
        sections: (rows as any[]).map((r) => ({
          section_key:   r.section_key,
          display_order: r.display_order ?? 0,
          is_enabled:    r.is_enabled === 1,
        })),
      },
      { headers: NO_CACHE },
    );
  } catch (err) {
    console.error('[home/sections GET]', err);
    return NextResponse.json({ sections: [] }, { headers: NO_CACHE });
  }
}
