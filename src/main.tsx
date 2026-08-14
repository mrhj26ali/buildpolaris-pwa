import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import { AppProviders } from './app/providers'
import { router } from './app/router'
import { getDatabase } from './lib/db'
import { syncEngine } from './lib/sync/SyncEngine'
import './lib/i18n'
import './index.css'

void getDatabase().then(() => {
  void syncEngine.start()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </AuthProvider>
  </StrictMode>,
)
