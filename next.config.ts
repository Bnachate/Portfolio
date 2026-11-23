import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // PGlite ships a WASM build of Postgres: load it from node_modules instead of bundling it
  serverExternalPackages: ['@electric-sql/pglite'],
};

export default nextConfig;
