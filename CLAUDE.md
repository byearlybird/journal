# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A journaling application with end-to-end encryption, client-side SQLite storage, and sync via a separate API server. Users derive encryption keys from a passphrase (never sent to server).

**TODO**: Authentication system needs to be implemented.

This repository contains only the client-side SPA. The API server is in a separate repository.

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

### Client SPA

**`src/`** - Client web application (React + Bun)

- Runs in the browser
- Uses SQLite via `sqlocal` (WASM-based client-side database)
- React 19, TanStack Query for data management
- Tailwind CSS v4 for styling
- Entry point: `src/main.tsx`
- Communicates with a separate API server at `/api/*` endpoints

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
  1. Fetch encrypted database blob from API server (`GET /v0/backup`)
  2. Decrypt and merge into local database
  3. Encrypt local database and upload to API server (`PUT /v0/backup`)
- Uses `updated_at` timestamps for last-write-wins conflict resolution
- Merge logic in `src/db/merger.ts` handles combining remote and local state
- Data format: JSON with `notes` array and `schema_version` field
- Skips push if pull fails to avoid out-of-date overwrites
- Uses standard fetch API for server communication

**Migrations** (`src/db/migrations/`):

- Kysely migrations manage schema evolution
- Run automatically on app load via `AppProvider`
- Add new migrations as `YYYY-MM-DD-description.ts` in `src/db/migrations/`
- Migrations run in `AppProvider` before rendering children

### Authentication

**TODO**: Authentication needs to be implemented.

- Currently, auth is stubbed with no-ops (users always considered signed in)
- See `src/features/sync/use-sync-on-signin.tsx` and `src/features/sync/use-sync-on-interval.tsx`
- Session tokens should be sent with API requests to the separate API server
- API server should validate session tokens and protect `/v0/*` routes

### API Endpoints

The client expects the following API endpoints from the separate API server:

- `GET /v0/backup` - Download encrypted database for current user
- `PUT /v0/backup` - Upload encrypted database for current user

These endpoints are implemented in a separate API server repository.

### State Management

**Client state** (`src/features/` and `src/providers/`):

- TanStack Query manages all data fetching and mutations
- `AppProvider` wraps app with `QueryClientProvider`
- All queries auto-invalidate on any mutation (acceptable for local-first data)
- `SyncProvider` orchestrates background sync via custom hooks

### Environment Variables

**Environment variables** (`.env`):

- `PUBLIC_API_BASE_URL` - API server base URL (defaults to `http://localhost:3000`)
- `PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key

### Code Style

- Language: TypeScript (ESM) + React
- Formatting/linting: oxlint and oxfmt
- Prefer small, focused modules
- CSS: Tailwind CSS v4 for styling

### Commit Conventions

Commit messages follow lightweight Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `tech:`.

## Key Files

- `src/utils/crypto.ts` - Encryption/decryption utilities
- `src/db/db.ts` - Database schema and client setup
- `src/db/merger.ts` - Conflict-free merge logic (dump/merge functions)
- `src/features/sync/client.ts` - Sync orchestration (syncPull/syncPush/sync functions)
- `src/features/sync/sync-provider.tsx` - Sync hooks coordination
- `src/providers/app-provider.tsx` - App initialization and migration runner
- `src/main.tsx` - App entry point with providers
- `src/server.ts` - Bun.serve() entry point for dev and production
- `build.ts` - Production build script using Bun.build()
