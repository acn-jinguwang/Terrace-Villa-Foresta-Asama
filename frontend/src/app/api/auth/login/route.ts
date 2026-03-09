import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { createSessionToken, hashPassword, COOKIE_NAME } from '@/lib/auth';

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: string;
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const raw   = await readFile(USERS_PATH, 'utf-8');
    const users: User[] = JSON.parse(raw);
    const user  = users.find((u) => u.username === username);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const hash = await hashPassword(password);
    if (hash !== user.passwordHash) {
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
      maxAge:   60 * 60 * 24, // 24 hours
    });
    return response;
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
