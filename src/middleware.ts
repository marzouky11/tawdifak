import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminAuthSafe, getAdminFirestoreSafe } from '@/lib/firebase-admin';

// Extra server-side layer for /admin/*, on top of (not instead of):
//  1. The client-side `userData?.isAdmin` check already in each admin page.
//  2. The real enforcement in firestore.rules.
//
// NOTE: Next.js only recognizes middleware from a file literally named
// `middleware.ts` at the project/src root, exporting a function named
// `middleware`. This file replaces the previous `src/proxy.ts`, which used
// the wrong filename/export name and was therefore never actually executed
// by the framework.
//
// If the Admin SDK isn't configured yet (missing env vars), this fails
// OPEN (lets the request through) instead of locking everyone out of the
// admin panel by accident. Once you add the 3 required env vars
// (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY),
// this protection activates automatically without any other change.
export async function middleware(request: NextRequest) {
  const adminAuth = getAdminAuthSafe();
  const adminDb = getAdminFirestoreSafe();

  if (!adminAuth || !adminDb) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get('session')?.value;
  const loginUrl = new URL('/login', request.url);

  if (!sessionCookie) {
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
    const isAdmin = userDoc.exists && userDoc.data()?.isAdmin === true;

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (error) {
    console.error('middleware: session verification failed:', error);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
