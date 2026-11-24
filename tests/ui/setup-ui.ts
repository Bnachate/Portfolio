// Loaded for every test file (see vitest.config.ts). Only does DOM work in jsdom test files
// (tests/ui/*.test.tsx start with `// @vitest-environment jsdom`).
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

// Admin components navigate with the App Router: tests read this mock
export const routerMock = { push: vi.fn(), refresh: vi.fn(), replace: vi.fn(), back: vi.fn() };
vi.mock('next/navigation', () => ({ useRouter: () => routerMock }));

if (typeof window !== 'undefined') {
  // Vitest globals are off, so Testing Library cannot register its own cleanup
  const { cleanup } = await import('@testing-library/react');
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // jsdom lacks a few browser APIs used by Radix UI (dialogs, dropdowns)
  window.matchMedia ??= (query: string) =>
    ({ matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }) as unknown as MediaQueryList;
  window.HTMLElement.prototype.scrollIntoView ??= function scrollIntoView() {};
  window.HTMLElement.prototype.hasPointerCapture ??= () => false;
  window.HTMLElement.prototype.releasePointerCapture ??= () => {};
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
