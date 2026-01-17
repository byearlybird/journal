# Repository Guidelines

## Project Structure

- `src/`: React + TypeScript client (Vite entry at `src/main.tsx`, root component `src/App.tsx`).
- `worker/`: Cloudflare Worker code (entry at `worker/index.ts`).
- `public/`: Static assets served as-is (e.g. `public/vite.svg`).
- `dist/`: Build output (generated; do not edit by hand).
- `.wrangler/`: Local Wrangler state/logs (generated; safe to delete).

## Build, Test, and Development Commands

Always use pnpm for installs and scripts.

- Install dependencies: `pnpm install`
- Run dev server: `pnpm dev`
- Typecheck + build: `pnpm build` (runs `tsc -b` then `vite build`)
- Preview production build: `pnpm preview`
- Lint: `pnpm lint` (oxlint)
- Format: `pnpm fmt` (oxfmt)

## Coding Style & Naming Conventions

- Language: TypeScript (ESM) + React.
- Formatting/linting: oxlint and oxfmt with consistent code style.
- Prefer small, focused modules; keep UI in `app/` and Worker-only logic in `worker/`.
- CSS: Tailwind CSS v4 for styling.

## Testing Guidelines

No automated test setup is currently configured in this repo.

- If you add tests, prefer vitest and name files `*.test.ts` / `*.test.tsx`.
- Place tests next to code (e.g. `app/foo.test.ts`) unless a dedicated test directory is introduced.

## Commit & Pull Request Guidelines

- Commit messages generally follow lightweight Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `tech:`.
- PRs should include: summary of what/why, verification steps (commands run), and screenshots for UI changes.
- Link the relevant issue/ticket and call out any config/env changes (e.g. `wrangler.jsonc`, `.env.local`, `.dev.vars`).

## Configuration & Security

- Keep secrets out of git. Use `.env.local` and `.dev.vars` for local configuration.
- Wrangler/Vite integration may write logs; this repo routes Wrangler logs to `.wrangler/logs/` during build.
