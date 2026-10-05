import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

// حدود معدل الطلبات لكل مسار حساس: [عدد الطلبات المسموحة, مدة النافذة بالميلي ثانية]
const RATE_LIMITS: Record<string, [number, number]> = {
  '/api/session-login': [10, 60_000], // 10 محاولات دخول / الدقيقة لكل IP
  '/api/verify-turnstile': [20, 60_000], // 20 تحقق / الدقيقة لكل IP
};

// Extra server-side layer for /admin/*, on top of (not instead of):
//  1. The client-side `userData?.isAdmin` check already in each admin page.
//  2. The real enforcement in firestore.rules.
//
// NOTE: Next.js only recognizes middleware from a file literally named
// `middleware.ts` at the project/src root, exporting a function named
// `middleware`.
//
// IMPORTANT: middleware runs on the Edge runtime, which does NOT support
// Node.js core modules (fs, net, http, ...). The Firebase Admin SDK relies
// on those modules, so it can never run here — importing it in this file
// makes Vercel flag the deployed edge function as broken ("referencing
// unsupported modules"), even though the build itself succeeds.
//
// So this middleware intentionally does the lightweight, Edge-safe check
// only: is there a `session` cookie at all? It can't verify the cookie or
// look up `isAdmin` (that needs the Admin SDK / Node runtime), so the real
// admin verification stays where it already is: the client-side check in
// each admin page, backed by firestore.rules as the actual enforcement.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) حماية مسارات API الحساسة من الطلبات المتكررة/التلقائية (بوتات)
  const limitConfig = RATE_LIMITS[pathname];
  if (limitConfig) {
    const [limit, windowMs] = limitConfig;
    const ip = getClientIp(request);
    const result = rateLimit(`${pathname}:${ip}`, limit, windowMs);

    if (!result.success) {
      return NextResponse.json(
        { error: 'too_many_requests', message: 'محاولات كثيرة جداً، يرجى المحاولة بعد قليل.' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }
  }

  // 2) الحماية الموجودة أصلاً لمسار /admin/*
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/session-login', '/api/verify-turnstile'],
};
