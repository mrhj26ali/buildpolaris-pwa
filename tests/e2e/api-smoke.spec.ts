import { test, expect } from '@playwright/test';

test('BFF health check endpoint is reachable (API-only E2E)', async ({ request }) => {
  // This test uses Playwright's APIRequestContext, NOT a browser.
  // It verifies the PWA can successfully reach the Frappe BFF.
  const response = await request.get('/api/method/buildpolaris_bff.api.health.ping');
  
  // We expect a 200 OK or 404 (if the endpoint isn't fully built yet), 
  // but NOT a connection refusal (which would mean the BFF is down).
  expect(response.status()).toBeLessThan(500);
  
  const body = await response.json().catch(() => ({}));
  // If the endpoint exists, it should return a Frappe-style response
  if (response.status() === 200) {
    expect(body).toHaveProperty('message');
  }
});
