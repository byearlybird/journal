# Journal

A journaling app.

## Project Structure

- `worker/` - Cloudflare Worker runtime (server-side) code
- `app/` - Client web-app code
- `lib/` - Shared and runtime-agnostic code

## Development (Bun)

- Install deps: `bun install`
- Run locally: `bun run dev`
- Format/lint (writes fixes): `bun run check`

## Build

- Production build: `bun run build`
- Preview build: `bun run preview`
