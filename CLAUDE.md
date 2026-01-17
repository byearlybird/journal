# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A journaling application with end-to-end encryption, client-side SQLite storage, and sync via Cloudflare Workers + R2. Users authenticate via Clerk and derive encryption keys from a passphrase (never sent to server).

## Commands

### Development

- Install dependencies: `pnpm install`
- Start dev server: `pnpm dev` - Runs Vite dev server on localhost
- Lint: `pnpm lint` - Runs oxlint
- Lint with fixes: `pnpm lint:fix`
- Format: `pnpm fmt` - Runs oxfmt formatter
- Format check: `pnpm fmt:check`

### Build & Deploy

- Production build: `pnpm build` - Compiles TypeScript and builds both client (Vite) and worker (Wrangler)
- Preview build: `pnpm preview` - Preview production build locally
- Deploy: Use Wrangler commands for Cloudflare Workers deployment

### Testing

No automated test setup is currently configured. If adding tests, prefer vitest and name files `*.test.ts` / `*.test.tsx`.

## Architecture

### Two-Layer Structure

1. **`src/`** - Client web application (React + Vite)
   - Runs in the browser
   - Uses SQLite via `sqlocal` (WASM-based client-side database)
   - React 19, TanStack Query for data management
   - Tailwind CSS v4 for styling
   - Entry point: `src/main.tsx`

2. **`worker/`** - Cloudflare Worker (Hono server)
   - Runs on Cloudflare's edge
   - Handles API requests at `/api/*`
   - Stores encrypted database blobs in R2
   - Clerk authentication middleware protects all `/api/*` routes
   - Entry point: `worker/index.ts`

### Path Aliases

TypeScript path aliases configured in `vite.config.ts`:

- `@app/*` → `./src/*`
- `@worker/*` → `./worker/*`

### TypeScript Configuration

Project uses composite TypeScript setup:

- `tsconfig.json` - Root references file
- `tsconfig.app.json` - Client app config
- `tsconfig.worker.json` - Worker config
- `tsconfig.node.json` - Node build scripts config

### End-to-End Encryption

**Key principle**: Server never sees unencrypted data or encryption keys.

1. User provides a passphrase in the client
2. Client derives AES-GCM key via PBKDF2 (100k iterations, userId as salt)
3. All journal data is encrypted client-side before storage or sync
4. Worker only handles opaque encrypted blobs in R2

**Crypto utilities** (`src/utils/crypto.ts`):

- `deriveKey(passphrase, userId)` - PBKDF2 key derivation from passphrase
- `encrypt(plaintext, key)` / `decrypt(base64Data, key)` - Text encryption/decryption
- `encryptFile(data, key)` / `decryptFile(encryptedData, key)` - Binary data encryption (for database files)
- All functions use AES-GCM with 12-byte IV prepended to ciphertext
- Returns base64-encoded strings for text, ArrayBuffers for binary data

### Database & Sync

**Client-side database** (`src/db/`):

- SQLite via `sqlocal` (WASM-based, runs in browser)
- Kysely for type-safe query building
- Database file: `journal-local-9192390.db`
- Schema: `note` table (id, content, created_at, updated_at, deleted_at)

**Sync mechanism** (`src/features/sync/`):

- Three sync triggers:
  - Interval polling (periodic background sync)
  - On mutation (immediate sync after data changes)
  - On sign-in (initial sync when user authenticates)
- Pull-merge-push strategy (`src/features/sync/client.ts`):
  1. Fetch encrypted database blob from R2
  2. Decrypt and merge into local database
  3. Encrypt local database and upload to R2
- Uses `updated_at` timestamps for last-write-wins conflict resolution
- Merge logic in `src/db/merger.ts` handles combining remote and local state
- Data format: JSON with `notes` array and `schema_version` field
- Skips push if pull fails to avoid out-of-date overwrites

**Migrations** (`src/db/migrations/`):

- Kysely migrations manage schema evolution
- Run automatically on app load via `AppProvider`
- Add new migrations as `YYYY-MM-DD-description.ts` in `src/db/migrations/`
- Migrations run in `AppProvider` before rendering children

### Authentication

**Clerk integration**:

- Client uses `@clerk/clerk-react` with `ClerkProvider` in `src/main.tsx`
- Worker middleware (`worker/clerk-middleware.ts`) validates session tokens
- Middleware extracts `userId` and attaches to Hono context
- All `/api/*` routes are protected except `/api/status`

### API Endpoints

Worker exposes:

- `GET /api/status` - Public health check
- `GET /api/journal` - Download encrypted database for current user
- `PUT /api/journal` - Upload encrypted database for current user

R2 storage key format: `{userId}:journal`

### State Management

**Client state** (`src/features/` and `src/providers/`):

- TanStack Query manages all data fetching and mutations
- `AppProvider` wraps app with `QueryClientProvider`
- All queries auto-invalidate on any mutation (acceptable for local-first data)
- `SyncProvider` orchestrates background sync via custom hooks

### Cloudflare Workers Configuration

**`wrangler.jsonc`**:

- Worker entry point: `worker/index.ts`
- R2 bucket binding: `journal_bucket` (bucket name: `journal-bucket`)
- Assets serve as SPA (single-page-application routing)

**Environment variables** (`.env`/`.dev.vars`):

- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk public key (client)
- `CLERK_SECRET_KEY` - Clerk secret key (worker only)

### Code Style

- Language: TypeScript (ESM) + React
- Formatting/linting: oxlint and oxfmt
- Prefer small, focused modules
- Keep UI in `src/` and Worker-only logic in `worker/`
- CSS: Tailwind CSS v4 for styling

### Commit Conventions

Commit messages follow lightweight Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `tech:`.

## Key Files

- `worker/index.ts` - Hono server with journal API
- `worker/clerk-middleware.ts` - Authentication middleware
- `src/utils/crypto.ts` - Encryption/decryption utilities
- `src/db/db.ts` - Database schema and client setup
- `src/db/merger.ts` - Conflict-free merge logic (dump/merge functions)
- `src/features/sync/client.ts` - Sync orchestration (syncPull/syncPush/sync functions)
- `src/features/sync/sync-provider.tsx` - Sync hooks coordination
- `src/providers/app-provider.tsx` - App initialization and migration runner
- `src/main.tsx` - App entry point with providers
