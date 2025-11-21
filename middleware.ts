import { NextResponse, type NextRequest } from 'next/server';

interface SessionData {
  id: string;
  role: string;
  username: string;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow /login without session
  if (path.startsWith('/login')) {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get('session');
  
  // Parse session data
  let session: SessionData | null = null;
  if (sessionCookie?.value) {
    try {
      session = JSON.parse(sessionCookie.value) as SessionData;
    } catch (error) {
      // Invalid session cookie, treat as no session
      session = null;
    }
  }

  // Protect /dashboard/admin routes - only allow if user.role === "admin"
  if (path.startsWith('/dashboard/admin')) {
    if (!session || session.role !== 'admin') {
      // No session or not an admin, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  // Protect /dashboard/user routes - only allow if user.role === "user"
  if (path.startsWith('/dashboard/user')) {
    if (!session || session.role !== 'user') {
      // No session or not a user, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

