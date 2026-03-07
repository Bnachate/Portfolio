import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware pour protéger les routes authentifiées
 * Vérifie les cookies de token et redirige vers /login si nécessaire
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes protégées
  const protectedRoutes = ['/admin'];

  // Vérifier si la route demandée est protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Vérifier si les tokens existent dans les cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!accessToken || !refreshToken) {
      // Rediriger vers login si pas de token
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Configuration du matcher pour appliquer le middleware
 * à certaines routes uniquement
 */
export const config = {
  matcher: ['/admin/:path*'],
};
