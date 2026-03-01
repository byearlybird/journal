# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A journaling application with end-to-end encryption, client-side SQLite storage, and sync. Users derive encryption keys from a passphrase (never sent to server). The API server runs in the same Bun process as the SPA, mounted at `/api/*` via Hono.

**TODO**: Authentication system needs to be implemented.

## Commands

### Development

- Install dependencies: `bun install`
- Start dev server: `bun dev` - Runs Bun dev server with HMR on localhost
- Lint: `bun lint` - Runs oxlint
- Lint with fixes: `bun lint:fix`
- Format: `bun fmt` - Runs oxfmt formatter
- Format check: `bun fmt:check`

### Build & Deploy

- Production build: `bun run build` - Builds the client SPA with Bun bundler
- Start production: `bun start` - Runs production server
- Deploy: Deploy the built SPA to your hosting provider

### Testing

No automated test setup is currently configured. If adding tests, prefer vitest and name files `*.test.ts` / `*.test.tsx`.

## Architecture

### Unified Server

**`src/server.ts`** — Single Bun.serve() entry point serving both the SPA and API:

- `/api/*` routes delegate to the Hono app (`src/api/index.ts`)
- `/*` serves the SPA (`src/app/index.html`)
- No CORS needed — everything is same-origin

### Client SPA

**`src/app/`** - Client web application (React + Bun)

- Runs in the browser
- Uses IndexedDB via `idb` for client-side storage
- React 19, nanostores for state management
- Tailwind CSS v4 for styling
- Entry point: `src/app/main.tsx`
- API calls use relative URLs (`/api/v0/backup`)

### API Server

**`src/api/`** - Hono API server (runs server-side in the same Bun process)

- Hono framework with Zod validation
- Clerk authentication middleware (`src/api/clerk-middleware.ts`)
- LibSQL/Turso database via Kysely (`src/api/db/`)
- Database migrations run on startup via top-level await
- Routes: `GET /api/status`, `GET /api/v0/backup`, `PUT /api/v0/backup`

### Path Aliases

TypeScript path aliases configured in `tsconfig.json`:

- `@/*` → `./src/*`

### TypeScript Configuration

Single flat `tsconfig.json` for the entire project.

### End-to-End Encryption

**Key principle**: Server never sees unencrypted data or encryption keys.

1. User provides a passphrase in the client
2. Client derives AES-GCM key via PBKDF2 (100k iterations, userId as salt)
3. All journal data is encrypted client-side before storage or sync
4. API server only handles opaque encrypted blobs

**Crypto utilities** (`src/app/utils/crypto.ts`):

- `deriveKey(passphrase, userId)` - PBKDF2 key derivation from passphrase
- `encrypt(plaintext, key)` / `decrypt(base64Data, key)` - Text encryption/decryption
- `encryptFile(data, key)` / `decryptFile(encryptedData, key)` - Binary data encryption (for database files)
- All functions use AES-GCM with 12-byte IV prepended to ciphertext
- Returns base64-encoded strings for text, ArrayBuffers for binary data

### Database & Sync

**Client-side database** (`src/app/db/`):

- IndexedDB via `idb` (runs in browser)
- Schema: `note` table (id, content, created_at, updated_at, deleted_at)

**Server-side database** (`src/api/db/`):

- LibSQL/Turso via Kysely
- Schema: `backups` table (id, user_id, data, created_at, updated_at)
- Migrations run automatically on server startup

**Sync mechanism** (`src/app/features/sync/`):

- Three sync triggers:
  - Interval polling (periodic background sync)
  - On mutation (immediate sync after data changes)
  - On sign-in (initial sync when user authenticates)
- Pull-merge-push strategy (`src/app/features/sync/client.ts`):
  1. Fetch encrypted database blob from API (`GET /api/v0/backup`)
  2. Decrypt and merge into local database
  3. Encrypt local database and upload to API (`PUT /api/v0/backup`)
- Uses `updated_at` timestamps for last-write-wins conflict resolution
- Merge logic in `src/app/db/merger.ts` handles combining remote and local state
- Data format: JSON with `notes` array and `schema_version` field
- Skips push if pull fails to avoid out-of-date overwrites

**Migrations** (`src/app/db/migrations/`):

- Kysely migrations manage client-side schema evolution
- Run automatically on app load via `AppProvider`
- Add new migrations as `YYYY-MM-DD-description.ts` in `src/app/db/migrations/`

### Authentication

**TODO**: Authentication needs to be implemented.

- Currently, auth is stubbed with no-ops (users always considered signed in)
- See `src/app/features/sync/use-sync-on-signin.tsx` and `src/app/features/sync/use-sync-on-interval.tsx`
- Clerk middleware on the API validates session tokens for `/v0/*` routes
- Session tokens should be sent with API requests

### API Endpoints

- `GET /api/status` - Health check (no auth required)
- `GET /api/v0/backup` - Download encrypted database for current user
- `PUT /api/v0/backup` - Upload encrypted database for current user

### State Management

**Client state** (`src/app/features/` and `src/app/`):

- Nanostores for state management
- `AppProvider` wraps app initialization
- `SyncProvider` orchestrates background sync via custom hooks

### Environment Variables

**Client variables** (exposed to browser via `PUBLIC_` prefix):

- `PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key

**Server variables** (server-side only, not bundled into client):

- `CLERK_SECRET_KEY` - Clerk secret key
- `DATABASE_URL` - LibSQL/Turso database URL (e.g. `file:./database.db` for local dev)
- `DATABASE_AUTH_TOKEN` - Turso auth token (optional for local dev)

Note: The API server reuses `PUBLIC_CLERK_PUBLISHABLE_KEY` for its Clerk client — no separate `CLERK_PUBLISHABLE_KEY` needed.

### Code Style

- Language: TypeScript (ESM) + React
- Formatting/linting: oxlint and oxfmt
- Prefer small, focused modules
- CSS: Tailwind CSS v4 for styling

### Commit Conventions

Commit messages follow lightweight Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `tech:`.

## Key Files

- `src/server.ts` - Unified Bun server entry point (SPA + API)
- `src/api/index.ts` - Hono API app setup, migration runner
- `src/api/clerk-middleware.ts` - Clerk authentication middleware
- `src/api/backup-routes.ts` - Backup API route handlers
- `src/api/backup-service.ts` - Backup business logic
- `src/api/backup-repo.ts` - Backup data access layer
- `src/api/db/` - Server database client, schema, migrations
- `src/app/utils/crypto.ts` - Encryption/decryption utilities
- `src/app/db/db.ts` - Client database schema and setup
- `src/app/db/merger.ts` - Conflict-free merge logic (dump/merge functions)
- `src/app/features/sync/client.ts` - Sync orchestration (syncPull/syncPush/sync functions)
- `src/app/features/sync/sync-provider.tsx` - Sync hooks coordination
- `src/app/app.tsx` - App initialization and migration runner
- `src/app/main.tsx` - App entry point with providers
- `build.ts` - Production build script using Bun.build()
