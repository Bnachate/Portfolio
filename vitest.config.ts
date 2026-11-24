import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname) },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    // Each test file gets its own in-memory database: keep files isolated
    pool: 'forks',
    // PGlite boots a WASM Postgres: first queries can take a few seconds
    testTimeout: 30_000,
    hookTimeout: 60_000,
    // `npm run test:coverage`: server code, API routes and the pure helpers they rely on.
    // React components are not unit tested (end-to-end tests will cover the UI).
    coverage: {
      provider: 'v8',
      include: ['server/**', 'app/api/**', 'proxy.ts', 'app/components/experience/format.ts'],
      reporter: ['text', 'html'],
    },
  },
});
