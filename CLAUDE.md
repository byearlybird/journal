# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Journal by Early Bird** is a local-first, privacy-focused journaling web application. All data is stored locally in the user's browser using IndexedDB via the Starling DB library. The app is built as a Progressive Web App (PWA) with offline support.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Routing**: TanStack Router (file-based routing)
- **Database**: Starling DB (@byearlybird/starling) - local-first database with IndexedDB plugin
- **Styling**: Tailwind CSS 4 with custom utility classes
- **Build Tool**: Vite (using rolldown-vite fork)
- **Linting/Formatting**: Biome
- **Animation**: Motion library
- **Icons**: Phosphor Icons React

## Common Commands

### Development
```bash
bun run dev          # Start development server with HMR
bun run build        # Production build
bun run start        # Preview production build
```

### Code Quality
```bash
bun run lint         # Run Biome linter
bun run format       # Format code with Biome
bun run check        # Run Biome check and auto-fix issues
```

## Architecture

### Directory Structure

- **`src/app/routes/`** - File-based routes (auto-generated route tree)
  - `__root.tsx` - Root layout with DbProvider and NavBar
  - `index.tsx` - Journal home page (today's entries)
  - `settings.tsx` - Settings page with import/export

- **`src/features/`** - Feature modules organized by domain
  - `journal/` - Journal entry components, resources, and utilities
  - `data/` - Data import/export functionality

- **`src/lib/`** - Shared utilities and infrastructure
  - `db/` - Database setup (Starling DB with schema)
  - `context/` - React contexts
  - `hooks/` - Custom React hooks
  - `stores/` - State management
  - `utils/` - Utility functions

- **`src/components/`** - Reusable UI components (layout, etc.)

### Data Model

The app uses Starling DB with three collections defined in `src/lib/db/schema.ts`:

- **`notes`** - Journal entries with content
- **`tasks`** - Task entries with status (incomplete/complete/deferred)
- **`comments`** - Comments/reflections on entries (linked via entryId)

All entities share a base schema with `id` (UUID) and `createdAt` (ISO datetime).

The discriminated union type `Entry` represents either a Note or Task with a `type` field.

### TanStack Router Conventions

- Routes are file-based in `src/app/routes/`
- The router plugin auto-generates `src/routeTree.gen.ts` - **do not edit manually**
- Route configuration is in `vite.config.ts`:
  - `routesDirectory: "./src/app/routes"`
  - `autoCodeSplitting: true`
- Use `createRootRoute()` for root layout
- TypeScript inference is automatically enabled for routing

### Database Access

- Use `useDatabase()` hook from `@/lib/db/context` to access the database
- Database is initialized once in the root route via `<DbProvider>`
- All operations use Starling's reactive API (queries, mutations)
- Export: `db.toDocuments()` serializes entire database
- Import: `db.loadDocuments()` restores from exported data

### Styling

- Uses Tailwind CSS 4 with tab indentation (configured in biome.json)
- Vite plugin handles Tailwind compilation
- Custom CSS in `src/app/app.css`
- Component variants use CVA (cva package)

### Code Style

Per biome.json configuration:
- **Indentation**: Tabs (not spaces)
- **Quotes**: Double quotes for JavaScript/TypeScript
- **Line length**: Auto-formatted by Biome
- Import organization is automatic via Biome assist

### Path Aliases

The `@/` alias maps to `./src/` (configured in tsconfig.json and vite.config.ts).

Example: `import { db } from "@/lib/db"`

### PWA Configuration

The app is configured as a PWA in `vite.config.ts`:
- Auto-updates enabled
- Service worker handles offline caching
- Manifest includes app metadata and icons
- Google Fonts are cached for offline use

## Key Patterns

### Creating New Routes

1. Add file to `src/app/routes/` (e.g., `about.tsx`)
2. Export a route using TanStack Router's `createRoute()` or `createFileRoute()`
3. The router plugin will auto-update `routeTree.gen.ts`

### Working with the Database

```typescript
// In a component
const db = useDatabase();

// Query data
const notes = db.notes.find();

// Create entry
const newNote = db.notes.create({ content: "..." });

// Update entry
db.notes.update(noteId, { content: "updated" });

// Delete entry
db.notes.delete(noteId);
```

### Data Import/Export

- Export hook: `useExportData()` in `src/features/data/`
- Import hook: `useImportData()` in `src/features/data/`
- Format: JSON with all documents from all collections
- Filenames include ISO timestamp
