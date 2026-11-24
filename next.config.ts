import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Content Security Policy: only our own scripts, styles and API calls.
 * - 'unsafe-inline' scripts: needed by the inline bootstrap scripts Next injects (no nonce setup here)
 * - 'unsafe-eval' only in dev, for React Refresh
 * - images may come from any https URL (project screenshots are hosted elsewhere)
 * - frame-ancestors 'none': the site cannot be embedded in another site (clickjacking)
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  // PGlite ships a WASM build of Postgres: load it from node_modules instead of bundling it
  serverExternalPackages: ['@electric-sql/pglite'],
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Not on PDFs: a CSP on the document can stop the browser's built-in PDF viewer (the CV)
      { source: '/:path((?!.*\\.pdf$).*)', headers: [{ key: 'Content-Security-Policy', value: contentSecurityPolicy }] },
    ];
  },
};

export default nextConfig;
