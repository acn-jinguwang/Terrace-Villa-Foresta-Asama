import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── /test/api/* → /api/* にリライトし x-test-mode ヘッダーを付与 ──────────
  if (pathname.startsWith('/test/api/')) {
    const rewritePath = pathname.replace('/test/api/', '/api/');
    const url = request.nextUrl.clone();
    url.pathname = rewritePath;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-test-mode', 'true');
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  // ── /test/admin/* 認証保護（/admin/* と同様） ─────────────────────────────
  if (pathname.startsWith('/test/admin') && !pathname.startsWith('/test/admin/login')) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/test/admin/login', request.url));
    }
    const session = await verifySessionToken(token);
    if (!session) {
      const response = NextResponse.redirect(new URL('/test/admin/login', request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  // ── /admin/* 認証保護 ──────────────────────────────────────────────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    const session = await verifySessionToken(token);
    if (!session) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/test/api/:path*', '/test/admin/:path*', '/admin/:path*'],
};
