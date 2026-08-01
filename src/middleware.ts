import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
