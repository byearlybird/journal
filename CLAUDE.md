# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm dev` — Vite dev server (also runs the Cloudflare Worker via `@cloudflare/vite-plugin`).
- `pnpm build` — `tsc -b` then `vite build`. Builds the SPA and the Worker.
- `pnpm lint` — `oxlint --fix`.
- `pnpm fmt` — `oxfmt`.
- `pnpm preview` — build then `vite preview`.
- `pnpm deploy` — build then `wrangler deploy`.
- `pnpm cf-typegen` — regenerate `worker-configuration.d.ts` from `wrangler.jsonc` bindings.
- `pnpm db:migrate` / `db:migrate:remote` — apply D1 migrations from `migrations/` to `journal-db` (local or remote).

Package manager is `pnpm@10.28.0`. There is no test runner configured.

## Architecture

This is an end-to-end-encrypted journaling SPA. Plaintext lives only on the client; the server stores opaque ciphertext.

### Two databases, two roles

- **Client (browser, SQLite via `sqlocal`)** — `src/db/client.ts` exposes a Kysely instance over an OPFS-backed SQLite database. Schema in `src/db/schema.ts`; migrations in `src/db/migrations/` are run on every route load via `src/db/migrator.ts` (called from `src/routes/__root.tsx`). This is the source of truth for the user's data.
- **Server (Cloudflare D1)** — `migrations/` (SQL) defines a single `changes` table of opaque ciphertext rows plus `user_keys` for wrapped DEKs. The Worker never sees plaintext.

### Sync model (HLC + change log)

The client tracks all mutations to syncable tables in a `sync_changes` outbox, stamped with a hybrid logical clock. The mechanics:

- `src/db/migrations/sync-helpers.ts` — `createSyncTable()` installs three SQLite triggers per syncable table (`AFTER INSERT`, `AFTER UPDATE`, `BEFORE DELETE`). They advance `client_state.hlc_wall`/`hlc_count`, stamp the row's `hlc` column with a lexicographically sortable `wall@count@node_id`, and enqueue an entry in `sync_changes` (`mutate` or `tombstone`).
- The `BEFORE DELETE` trigger is gated on `client_state.is_applying_remote = 0` so that pulled deletes don't re-enter the outbox.
- `src/services/sync-service.ts` — `fullSync()` pulls then pushes:
  - **Pull**: decrypt each ciphertext payload, apply mutate/tombstone with HLC last-writer-wins (skip if a tombstone exists for the row), then merge the local clock against the max remote HLC via `mergeHlc` in `src/db/hlc.ts`.
  - **Push**: read the outbox, encrypt each payload, send, then delete pushed rows from `sync_changes`.
- `src/services/sync-service.ts` is transport-agnostic; `src/stores/sync-client.ts` wires it to the oRPC client.

When adding a new syncable table: define it in `src/db/schema.ts`, create it via `createSyncTable()` in a new migration, and the trigger machinery handles the rest. Do not write to `sync_changes` or `tombstone_table` directly.

### Encryption (zero-knowledge)

`src/crypto.ts` is the only crypto module.

- **DEK** (data encryption key, AES-256-GCM) is generated client-side, wrapped with a **KEK** derived from the user's password via PBKDF2 (600k iterations, SHA-256), and only the wrapped form is stored server-side (`user_keys` table, accessed via `getWrappedKey`/`setWrappedKey`/`changeWrappedKey` oRPC).
- The unwrapped DEK is cached in IndexedDB as a non-extractable `CryptoKey` (`vault.keys.dek`); locking clears it.
- Every sync payload is `encrypt(JSON.stringify(payload), dek)` → base64 `[12-byte IV][ciphertext]`.

### API (oRPC + Clerk)

- Contract: `worker/contract.ts` (Zod-validated input/output for `pushChanges`, `pullChanges`, `getWrappedKey`, `setWrappedKey`, `changeWrappedKey`).
- Worker handler: `worker/index.ts` mounts the oRPC router under `/api`. Every request is authenticated by `worker/auth.ts` (`authenticateRequest` → Clerk → `userId`) before routing; failures return 401.
- Client: `src/stores/api.ts` builds an `RPCLink` that injects the Clerk JWT.

### Frontend

- React 19 + TanStack Router (`src/routes/`, file-based, codegen in `src/routeTree.gen.ts` via `@tanstack/router-plugin/vite`).
- State: nanostores (`src/stores/`). User settings (`$userSettings`) drive `data-theme` / `data-accent` on `<html>` from `src/main.tsx`.
- Auth: `@clerk/react` `<ClerkProvider>` wraps the router.
- Styling: Tailwind v4 via `@tailwindcss/vite`; UI primitives from `@base-ui/react`; icons from `@phosphor-icons/react`.
- Path aliases: `@/*` → `src/*`, `@worker/*` → `worker/*` (configured in both `tsconfig.app.json` and `vite.config.ts`).

### Repo layout note

`apps/client/` and `packages/{db,utils}/` exist but are mostly empty — current code lives in `src/` (frontend) and `worker/` (backend). Don't assume a workspace structure; treat the root as the single project until those directories are populated.

### Deployment

Cloudflare Worker named `journal`, custom domain `journal.byearlybird.com`, D1 binding `DB` → `journal-db`. SPA fallback (`not_found_handling: single-page-application`) is configured in `wrangler.jsonc`. Source maps are uploaded.

## Conventions

- ESM only (no CommonJS).
- `oxlint` enforces `typescript/no-explicit-any` and `no-unused-vars` as errors. The lint-disable comment syntax is `// oxlint-disable <rule>` (see `src/db/migrations/sync-helpers.ts`).
- TypeScript is strict with `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `verbatimModuleSyntax`.
