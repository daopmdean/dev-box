# dev-box

A lightweight, browser-based collection of developer utilities — inspired by
[devutils.com](https://devutils.com/), but simpler and easy to extend.

## Tools

- **Unix Time** — convert between epoch timestamps and human dates (live clock, auto s/ms detection)
- **JWT** — decode (no secret needed) and encode/sign HS256 tokens; optional signature verification
- **Base64** — UTF-8 safe encode/decode, with URL-safe variant
- **UUID / Random** — generate UUID v4 (bulk) and random strings (length + charset)
- **JSON Beautify** — format, re-indent (2/4/tab) and minify JSON with clear parse errors

## Getting started

```bash
npm install
npm run dev      # start the dev server, then open the printed localhost URL
```

Other scripts:

```bash
npm run build    # type-check + production build
npm run preview  # preview the production build
npm run test     # run unit tests (Vitest)
```

## Tech stack

React + Vite + TypeScript, Tailwind CSS, React Router. JWT signing uses
[`jose`](https://github.com/panva/jose); everything else relies on native
browser APIs.

## Adding a new tool

The app is built around a registry so adding a tool is a drop-in:

1. Create `src/tools/<name>/<Name>.tsx` exporting a default React component.
2. Add one entry to [`src/tools/registry.ts`](src/tools/registry.ts).

The sidebar nav and the router are generated from that registry — no other
wiring needed. Keep reusable, pure logic in `src/lib/` (it's unit-tested) and
reuse the shared UI in `src/components/ui/`.
