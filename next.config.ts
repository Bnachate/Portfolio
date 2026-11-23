import type { NextConfig } from 'next';

// Le site est servi sous https://bnachate.github.io/Portfolio en production.
// En dev, on garde la racine pour que http://localhost:3000 fonctionne.
const basePath = process.env.NODE_ENV === 'production' ? '/Portfolio' : '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true, // GitHub Pages sert /admin/index.html pour /admin/
  images: {
    unoptimized: true, // Obligatoire pour le déploiement statique sur GitHub Pages
  },
  env: {
    // Exposé au code client pour préfixer les chemins hors <Link>/router (img, a, window.location)
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
