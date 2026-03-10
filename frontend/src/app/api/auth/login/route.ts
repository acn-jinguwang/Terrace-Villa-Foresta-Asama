import { NextResponse } from 'next/server';
import { createSessionToken, hashPassword, COOKIE_NAME } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

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

    const token = await createSessionToken(user.id, user.username);
    const response = NextResponse.json({ ok: true, username: user.username });
    response.cookies.set({
      name:     COOKIE_NAME,
      value:    token,
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path:     '/',
      maxAge:   60 * 60 * 24,
    });
    return response;
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
