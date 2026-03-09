import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const PLANS_PATH = path.join(process.cwd(), 'data', 'plans.json');

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

async function readPlans(): Promise<PlanEntry[]> {
  try {
    const raw = await readFile(PLANS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function savePlans(plans: PlanEntry[]) {
  await writeFile(PLANS_PATH, JSON.stringify(plans, null, 2), 'utf-8');
}

// GET /api/plans — returns all plans (admin) or only visible (public via ?public=1)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const plans = await readPlans();
  if (url.searchParams.get('public') === '1') {
    return NextResponse.json(plans.filter((p) => p.visible));
  }
  return NextResponse.json(plans);
}

// PATCH /api/plans — reorder plans (body: { order: string[] })
export async function PATCH(request: Request) {
  try {
    const { order }: { order: string[] } = await request.json();
    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'order must be an array of IDs' }, { status: 400 });
    }
    const plans = await readPlans();
    const map = new Map(plans.map((p) => [p.id, p]));
    const reordered = order.map((id) => map.get(id)).filter(Boolean) as PlanEntry[];
    // Append any plans not in order list at the end
    plans.forEach((p) => { if (!order.includes(p.id)) reordered.push(p); });
    await savePlans(reordered);
    return NextResponse.json(reordered);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST /api/plans — create new plan
export async function POST(request: Request) {
  try {
    const body: Partial<PlanEntry> = await request.json();
    if (!body.id || !body.titleZh) {
      return NextResponse.json({ error: 'id and titleZh are required' }, { status: 400 });
    }
    const plans = await readPlans();
    if (plans.some((p) => p.id === body.id)) {
      return NextResponse.json({ error: 'Plan ID already exists' }, { status: 409 });
    }
    const plan: PlanEntry = {
      id: body.id,
      titleZh: body.titleZh ?? '', titleJa: body.titleJa ?? '', titleEn: body.titleEn ?? '',
      descZh:  body.descZh  ?? '', descJa:  body.descJa  ?? '', descEn:  body.descEn  ?? '',
      duration: body.duration ?? 1,
      price:    body.price   ?? '',
      tagZh: body.tagZh ?? '', tagJa: body.tagJa ?? '', tagEn: body.tagEn ?? '',
      highlightsZh: body.highlightsZh ?? [], highlightsJa: body.highlightsJa ?? [], highlightsEn: body.highlightsEn ?? [],
      coverImage: body.coverImage ?? '',
      visible:   body.visible ?? true,
      createdAt: new Date().toISOString(),
    };
    plans.push(plan);
    await savePlans(plans);
    return NextResponse.json(plan, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
