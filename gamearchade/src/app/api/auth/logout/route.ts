// POST /api/auth/logout — clears the server-side session cookie
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  // Expire the session cookie immediately
  response.headers.set(
    'Set-Cookie',
    'session-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
  );
  return response;
}
