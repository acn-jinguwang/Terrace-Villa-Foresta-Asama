import { NextResponse } from 'next/server';
import { createSessionToken, hashPassword, COOKIE_NAME } from '@/lib/auth';
import { getDb } from '@/lib/db';

function setCookie(response: NextResponse, token: string, isHttps: boolean) {
  response.cookies.set({
    name:     COOKIE_NAME,
    value:    token,
    httpOnly: true,
    secure:   isHttps,
    sameSite: 'lax',
    path:     '/',
    maxAge:   60 * 60 * 24,
  });
}

export async function POST(request: Request) {
  const { username, password } = await request.json().catch(() => ({}));
  if (!username || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  const proto   = request.headers.get('x-forwarded-proto') ?? '';
  const isHttps = proto === 'https' || request.url.startsWith('https://');

  // ── 1. Environment variable fallback (always checked first) ──────────────
  const envUser = process.env.ADMIN_USER;
  const envPass = process.env.ADMIN_PASS;
  if (envUser && envPass && username === envUser && password === envPass) {
    const token    = await createSessionToken('env-admin', username);
    const response = NextResponse.json({ ok: true, username });
    setCookie(response, token, isHttps);
    return response;
  }

  // ── 2. Database authentication ────────────────────────────────────────────
  try {
    const db = getDb();
    const [rows] = await db.query(
      'SELECT id, username, password_hash, role FROM users WHERE username = ? LIMIT 1',
      [username],
    ) as any[][];

    if (!rows.length) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = rows[0];
    const hash = await hashPassword(password);
    if (hash !== user.password_hash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token    = await createSessionToken(user.id, user.username);
    const response = NextResponse.json({ ok: true, username: user.username });
    setCookie(response, token, isHttps);
    return response;
  } catch (err) {
    console.error('[login] DB error:', err);
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
}
