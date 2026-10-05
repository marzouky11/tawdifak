import { NextResponse } from 'next/server';
import { getAdminAuthSafe } from '@/lib/firebase-admin';

const SESSION_COOKIE_NAME = 'session';
const EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    }

    const adminAuth = getAdminAuthSafe();
    if (!adminAuth) {
      // Admin SDK not configured on the server yet (missing env vars).
      // Skip silently so the normal client-side login flow is never blocked.
      return NextResponse.json({ skipped: true }, { status: 200 });
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: EXPIRES_IN_MS,
    });

    const response = NextResponse.json({ status: 'success' }, { status: 200 });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: EXPIRES_IN_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });
    return response;
  } catch (error) {
    console.error('session-login error:', error);
    // Never let a session-cookie failure break the client-side login itself.
    return NextResponse.json({ error: 'session_failed' }, { status: 200 });
  }
}
