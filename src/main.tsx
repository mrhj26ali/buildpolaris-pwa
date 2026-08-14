import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { AppProviders } from './app/providers';
import { getDatabase } from './lib/db/database';
import { syncEngine } from './lib/sync/SyncEngine';
import './index.css';

async function bootstrap() {
  await getDatabase();
  await syncEngine.start();
}

bootstrap().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>
);
