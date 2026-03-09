import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { PlanEntry } from '../route';

const PLANS_PATH = path.join(process.cwd(), 'data', 'plans.json');

async function readPlans(): Promise<PlanEntry[]> {
  try {
    return JSON.parse(await readFile(PLANS_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

async function savePlans(plans: PlanEntry[]) {
  await writeFile(PLANS_PATH, JSON.stringify(plans, null, 2), 'utf-8');
}

// GET /api/plans/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const plans = await readPlans();
  const plan = plans.find((p) => p.id === id);
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(plan);
}

// PUT /api/plans/[id] — full or partial update
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Partial<PlanEntry> = await request.json();
    const plans = await readPlans();
    const idx = plans.findIndex((p) => p.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    plans[idx] = { ...plans[idx], ...body, id }; // id is immutable
    await savePlans(plans);
    return NextResponse.json(plans[idx]);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE /api/plans/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plans = await readPlans();
    const updated = plans.filter((p) => p.id !== id);
    if (updated.length === plans.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    await savePlans(updated);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
