import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export const dynamic = 'force-dynamic';

export function GET() {
  const appDir = path.join(process.cwd(), '.next', 'server', 'app');
  const cacheDir = path.join(process.cwd(), '.next', 'server', 'app-paths-manifest.json');
  let files: string[] = [];
  let indexContent = '';
  let indexRscContent = '';
  let notFoundContent = '';
  let prerenderManifest: unknown = null;
  let appPathsManifest: unknown = null;

  try {
    files = fs.readdirSync(appDir);
  } catch (e: unknown) {
    files = [(e as Error).message];
  }

  try {
    indexContent = fs.readFileSync(path.join(appDir, 'index.html'), 'utf8').substring(0, 300);
  } catch (e: unknown) {
    indexContent = (e as Error).message;
  }

  try {
    indexRscContent = fs.readFileSync(path.join(appDir, 'index.rsc'), 'utf8').substring(0, 200);
  } catch (e: unknown) {
    indexRscContent = (e as Error).message;
  }

  try {
    notFoundContent = fs.readFileSync(path.join(appDir, '_not-found.html'), 'utf8').substring(0, 200);
  } catch (e: unknown) {
    notFoundContent = (e as Error).message;
  }

  try {
    const raw = fs.readFileSync(path.join(process.cwd(), '.next', 'prerender-manifest.json'), 'utf8');
    prerenderManifest = JSON.parse(raw);
  } catch (e: unknown) {
    prerenderManifest = (e as Error).message;
  }

  try {
    appPathsManifest = JSON.parse(fs.readFileSync(cacheDir, 'utf8'));
  } catch (e: unknown) {
    appPathsManifest = (e as Error).message;
  }

  let indexMeta: unknown = null;
  let notFoundMeta: unknown = null;
  try {
    indexMeta = JSON.parse(fs.readFileSync(path.join(appDir, 'index.meta'), 'utf8'));
  } catch (e: unknown) {
    indexMeta = (e as Error).message;
  }
  try {
    notFoundMeta = JSON.parse(fs.readFileSync(path.join(appDir, '_not-found.meta'), 'utf8'));
  } catch (e: unknown) {
    notFoundMeta = (e as Error).message;
  }

  return NextResponse.json({
    cwd: process.cwd(),
    appDir,
    files,
    indexHtmlPreview: indexContent,
    indexRscPreview: indexRscContent,
    notFoundHtmlPreview: notFoundContent,
    indexMeta,
    notFoundMeta,
    prerenderManifest,
    appPathsManifest,
  });
}
