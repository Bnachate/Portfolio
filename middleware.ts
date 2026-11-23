import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware protecting authenticated routes
 * Checks the token cookies and redirects to /login if needed
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ['/admin'];

  // Check whether the requested route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Check that the tokens exist in the cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!accessToken || !refreshToken) {
      // Redirect to login if there is no token
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Matcher configuration so the middleware only
 * runs on specific routes
 */
export const config = {
  matcher: ['/admin/:path*'],
};
