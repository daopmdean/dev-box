# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server (default http://localhost:5173)
- `npm run build` — type-check (`tsc -b`) then production build
- `npm run preview` — serve the production build
- `npm run test` — run all unit tests once (Vitest)
- `npm run test:watch` — Vitest in watch mode
- Run a single test file: `npx vitest run src/lib/lib.test.ts`
- Run tests matching a name: `npx vitest run -t "round-trips ASCII"`

## Architecture

A browser-based collection of developer utilities (React 19 + Vite 6 + TypeScript,
Tailwind CSS v4 via `@tailwindcss/vite`, React Router 7). No backend — everything runs
client-side using native browser APIs, except JWT signing which uses `jose`.

The app is **registry-driven**, which is the central convention:

- `src/tools/registry.ts` exports the `tools: Tool[]` array — the single source of truth.
- `src/App.tsx` builds the router by mapping over `tools` (index redirects to `tools[0]`,
  `*` falls back to it).
- `src/components/Sidebar.tsx` builds the nav from the same array.
- `src/tools/types.ts` defines the `Tool` interface (`id`, `name`, `description`, `path`,
  `component`).

So adding a tool needs no router or nav wiring — only a component plus one registry entry.

Two-layer separation to preserve:

- `src/lib/` — pure, framework-free logic (`base64`, `json`, `jwt`, `random`, `unixtime`),
  covered by `src/lib/lib.test.ts`. Put testable logic here, not in components.
- `src/components/ui/` — shared presentational primitives (`Button`, `Input`, `TextArea`,
  `Field`, `CopyButton`). Reuse these in tool UIs rather than re-styling.

Tool UIs live in `src/tools/<name>/<Name>.tsx` as default-exported React components and
should stay thin, delegating real work to `src/lib/`.

## Adding a new tool

1. Add pure logic to `src/lib/<name>.ts` and a test in `src/lib/lib.test.ts`.
2. Create `src/tools/<name>/<Name>.tsx` (default-exported component) using `src/components/ui/`.
3. Add one entry to the `tools` array in `src/tools/registry.ts`.

## Testing notes

Vitest runs in the `node` environment (`vite.config.ts`) with globals enabled — tests cover
the pure `src/lib/` helpers and need no DOM. Keep new logic in `src/lib/` so it stays testable
without jsdom.
