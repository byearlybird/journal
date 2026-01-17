# Journal

A journaling app.

## Project Structure

- `worker/` - Cloudflare Worker runtime (server-side) code
- `app/` - Client web-app code
- `lib/` - Shared and runtime-agnostic code

## Development

- Install deps: `pnpm install`
- Run locally: `pnpm dev`
- Lint: `pnpm lint`
- Format: `pnpm fmt`

## Build

- Production build: `pnpm build`
- Preview build: `pnpm preview`
