# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A journaling application with end-to-end encryption, client-side SQLite storage, and sync via Cloudflare Workers + R2. Users authenticate via Clerk and derive encryption keys from a passphrase (never sent to server).

## Commands

### Development
- Start dev server: `bun run dev` - Runs Vite dev server on localhost
- Format/lint: `bun run check` - Runs Biome formatter/linter with auto-fix

### Build & Deploy
- Production build: `bun run build` - Compiles TypeScript and builds both client (Vite) and worker (Wrangler)
- Preview build: `bun run preview` - Preview production build locally
- Deploy: Use Wrangler commands for Cloudflare Workers deployment

### Linting
- Biome is configured with tab indentation, double quotes, and React recommended rules
- Uses `useSortedClasses` for Tailwind class ordering

## Architecture

### Three-Layer Structure

1. **`app/`** - Client web application (React + Vite)
   - Runs in the browser
   - Uses SQLite via `sqlocal` (WebAssembly-based client-side database)
   - React 19, TanStack Query for data management
   - Tailwind CSS v4 for styling

2. **`worker/`** - Cloudflare Worker (Hono server)
   - Runs on Cloudflare's edge
   - Handles API requests at `/api/*`
   - Stores encrypted database blobs in R2
   - Clerk authentication middleware protects all `/api/*` routes

3. **`lib/`** - Shared runtime-agnostic code
   - Currently contains cryptography utilities
   - Can run in both browser and worker environments

### Path Aliases

TypeScript path aliases configured in `vite.config.ts`:
- `@app/*` → `./app/*`
- `@worker/*` → `./worker/*`
- `@lib/*` → `./lib/*`

### TypeScript Configuration

Project uses composite TypeScript setup with 4 config files:
- `tsconfig.json` - Root references file
- `tsconfig.app.json` - Client app config
- `tsconfig.worker.json` - Worker config
- `tsconfig.lib.json` - Shared lib config
- `tsconfig.node.json` - Node build scripts config

### End-to-End Encryption

**Key principle**: Server never sees unencrypted data or encryption keys.

1. User provides a passphrase in the client
2. Client derives AES-GCM key via PBKDF2 (100k iterations, userId as salt)
3. All journal data is encrypted client-side before storage or sync
4. Worker only handles opaque encrypted blobs in R2

**Crypto utilities** (`lib/crypto.ts`):
- `deriveKey()` - PBKDF2 key derivation from passphrase
- `encrypt()/decrypt()` - Text encryption/decryption
- `encryptFile()/decryptFile()` - Binary data encryption (for database files)

### Database & Sync

**Client-side database** (`app/db/`):
- SQLite via `sqlocal` (WASM-based, runs in browser)
- Kysely for type-safe query building
- Schema: `note` table (id, content, created_at, eventstamp, tombstone)
- `sync_meta` table tracks Lamport clock for conflict resolution

**Sync mechanism** (`app/store/sync.tsx`):
- Polls remote every 10 seconds when signed in
- Pull-merge-push strategy:
  1. Fetch encrypted database blob from R2
  2. Decrypt and merge into local database
  3. Encrypt local database and upload to R2
- Uses eventstamps (Lamport timestamps) for last-write-wins conflict resolution
- Merge logic in `app/db/merger.ts` handles combining remote and local state

**Eventstamps** (`app/db/clock.ts`):
- Hybrid logical clock (HLC) implementation
- Format: `{millisecondsSinceEpoch}-{sequence}`
- Ensures total ordering of events across syncs
- Stored in `sync_meta` table, advanced on each write

**Migrations** (`app/db/migrations/`):
- Kysely migrations manage schema evolution
- Run automatically on app load via `DbProvider`
- Add new migrations as `YYYY-MM-DD-description.ts` in `app/db/migrations/`

### Authentication

**Clerk integration**:
- Client uses `@clerk/clerk-react` with `ClerkProvider` in `app/main.tsx`
- Worker middleware (`worker/clerk-middleware.ts`) validates session tokens
- Middleware extracts `userId` and attaches to Hono context
- All `/api/*` routes are protected except `/api/status`

### API Endpoints

Worker exposes:
- `GET /api/status` - Public health check
- `GET /api/journal` - Download encrypted database for current user
- `PUT /api/journal` - Upload encrypted database for current user

R2 key format: `{userId}:journal`

### State Management

**Client state** (`app/store/`):
- `crypto-key.tsx` - Stores derived encryption key in memory (nanostore atom)
- `sync.tsx` - Handles background sync polling and crypto key validation
- TanStack Query manages server state and mutations

**Database context** (`app/db/db-provider.tsx`):
- Wraps app in `DbProvider` + `QueryClientProvider`
- Provides `useDb()` hook for database access and eventstamp generation
- Invalidates all queries on any mutation (acceptable for local-first data)

### Cloudflare Workers Configuration

**`wrangler.jsonc`**:
- Worker entry point: `worker/index.ts`
- R2 bucket binding: `journal_bucket`
- Assets serve as SPA (single-page-application routing)

**Environment variables** (`.env`/`.dev.vars`):
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key (worker only)

## Key Files

- `worker/index.ts` - Hono server with journal API
- `worker/clerk-middleware.ts` - Authentication middleware
- `lib/crypto.ts` - Encryption/decryption utilities
- `app/db/db.ts` - Database schema and client setup
- `app/db/merger.ts` - Conflict-free merge logic
- `app/store/sync.tsx` - Background sync orchestration
- `app/main.tsx` - App entry point with providers
