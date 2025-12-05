# Repository Guidelines

## Project Structure

- `src/`: React + TypeScript client (Vite entry at `src/main.tsx`, root component `src/App.tsx`).
- `worker/`: Cloudflare Worker code (entry at `worker/index.ts`).
- `public/`: Static assets served as-is (e.g. `public/vite.svg`).
- `dist/`: Build output (generated; do not edit by hand).
- `.wrangler/`: Local Wrangler state/logs (generated; safe to delete).

## Build, Test, and Development Commands (Bun Only)

Always use Bun for installs and scripts (no npm/pnpm/yarn).

- Install dependencies: `bun install`
- Run dev server: `bun run dev`
- Typecheck + build: `bun run build` (runs `tsc -b` then `vite build`)
- Preview production build: `bun run preview`
- Format/lint (writes fixes): `bun run check` (Biome)

## Coding Style & Naming Conventions

- Language: TypeScript (ESM) + React.
- Formatting/linting: Biome (`biome.json`) with tab indentation and double quotes.
- Prefer small, focused modules; keep UI in `src/` and Worker-only logic in `worker/`.
- CSS Modules use `*.module.css`; generated typings (`*.d.ts`) are committed—regenerate by running the build if needed.

## Testing Guidelines

No automated test setup is currently configured in this repo.

- If you add tests, prefer Bun’s runner (`bun test`) and name files `*.test.ts` / `*.test.tsx`.
- Place tests next to code (e.g. `src/foo.test.ts`) unless a dedicated test directory is introduced.

## Commit & Pull Request Guidelines

- Commit messages generally follow lightweight Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `tech:`.
- PRs should include: summary of what/why, verification steps (commands run), and screenshots for UI changes.
- Link the relevant issue/ticket and call out any config/env changes (e.g. `wrangler.jsonc`, `.env.local`, `.dev.vars`).

## Configuration & Security

- Keep secrets out of git. Use `.env.local` and `.dev.vars` for local configuration.
- Wrangler/Vite integration may write logs; this repo routes Wrangler logs to `.wrangler/logs/` during build.
