import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname) },
  },
  test: {
    environment: 'node',
    // .tsx: React component tests in tests/ui (jsdom). Playwright specs live in e2e/ and are not run by Vitest.
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts', 'tests/ui/setup-ui.ts'],
    // Each test file gets its own in-memory database: keep files isolated
    pool: 'forks',
    // PGlite boots a WASM Postgres: first queries can take a few seconds
    testTimeout: 30_000,
    hookTimeout: 60_000,
    // `npm run test:coverage`: server code, API routes, the API client and the React components
    // (pages, SEO image files and the Next layout are covered by the Playwright suite instead).
    coverage: {
      provider: 'v8',
      include: ['server/**', 'app/api/**', 'proxy.ts', 'app/components/**', 'app/admin/**', 'app/auth/**', 'app/config/**'],
      reporter: ['text', 'html'],
    },
  },
});
