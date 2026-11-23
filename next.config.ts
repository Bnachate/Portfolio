import type { NextConfig } from 'next';

// The site is served under https://bnachate.github.io/Portfolio in production.
// In dev, keep the root so that http://localhost:3000 keeps working.
const basePath = process.env.NODE_ENV === 'production' ? '/Portfolio' : '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true, // GitHub Pages serves /admin/index.html for /admin/
  images: {
    unoptimized: true, // Required for static export on GitHub Pages
  },
  env: {
    // Exposed to client code to prefix paths outside <Link>/router (img, a, window.location)
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
