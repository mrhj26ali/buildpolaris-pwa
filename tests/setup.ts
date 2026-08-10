import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import '@testing-library/jest-dom/vitest';

// 1. Globally mock the CSRF token fetch to prevent MSW warnings
vi.mock('@/lib/bffClient', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/bffClient')>();
  return {
    ...mod,
    getCsrfToken: vi.fn().mockResolvedValue('mock-csrf-token-12345'),
  };
});

// 2. MSW Server setup
export const server = setupServer(
  // Catch-all for CSRF to ensure no network leaks during tests
  http.get('/api/method/buildpolaris_bff.api.auth.get_csrf_token', () => {
    return HttpResponse.json({ message: 'mock-csrf-token-12345' });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' })); // Changed to 'warn' to be less noisy
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());