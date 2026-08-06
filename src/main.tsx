import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { router } from './app/router';
import { initDatabase } from './lib/db';
import { syncEngine } from './lib/sync/SyncEngine';
import './index.css';

// Initialize offline-first stubs
initDatabase().then(() => syncEngine.start());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);