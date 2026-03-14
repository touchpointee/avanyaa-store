import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin/* routes (but NOT /admin/signin itself)
  if (pathname.startsWith('/admin') && pathname !== '/admin/signin') {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // No token or not an admin → redirect to admin sign-in
    if (!token || (token as any).role !== 'admin') {
      const signInUrl = new URL('/admin/signin', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all /admin routes
  matcher: ['/admin/:path*'],
};
