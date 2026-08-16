/// <reference types="vite/client" />

interface ImportMetaEnv {
  // NFR-PRIV.1/.2 — RxDB at-rest encryption password for the field-execution
  // collections (see lib/db/database.ts). Must be set per-environment; the
  // fallback in database.ts is dev-only and intentionally unfit for
  // production use.
  readonly VITE_RXDB_ENCRYPTION_PASSWORD?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
