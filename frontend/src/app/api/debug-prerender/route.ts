import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export const dynamic = 'force-dynamic';

export function GET() {
  const appDir = path.join(process.cwd(), '.next', 'server', 'app');
  let files: string[] = [];
  let indexContent = '';
  let indexRscContent = '';

  try {
    files = fs.readdirSync(appDir);
  } catch (e: unknown) {
    files = [(e as Error).message];
  }

  try {
    indexContent = fs.readFileSync(path.join(appDir, 'index.html'), 'utf8').substring(0, 200);
  } catch (e: unknown) {
    indexContent = (e as Error).message;
  }

  try {
    indexRscContent = fs.readFileSync(path.join(appDir, 'index.rsc'), 'utf8').substring(0, 500);
  } catch (e: unknown) {
    indexRscContent = (e as Error).message;
  }

  return NextResponse.json({
    cwd: process.cwd(),
    appDir,
    files,
    indexHtmlPreview: indexContent,
    indexRscPreview: indexRscContent,
  });
}
