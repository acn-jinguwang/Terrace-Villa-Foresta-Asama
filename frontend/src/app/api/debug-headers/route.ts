import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return NextResponse.json({
    url: request.url,
    nextUrl: {
      href: request.nextUrl.href,
      pathname: request.nextUrl.pathname,
      host: request.nextUrl.host,
      hostname: request.nextUrl.hostname,
      protocol: request.nextUrl.protocol,
      search: request.nextUrl.search,
    },
    method: request.method,
    headers,
  });
}
