# AGENTS.md

## Project Snapshot

RSSBook is a Bun-first RSS feed generator, feed utility toolkit, and lightweight blog/book platform.

The main package lives in `pkgs/rssbook` and is built with ElysiaJS.
Runtime adapters live under `platform/` for Cloudflare Workers, Deno, Netlify, Node.js, and Vercel.

Use Bun for JavaScript and TypeScript work unless there is a strong reason not to.

## Agent Rules

- Use Context7 MCP for current documentation whenever working with a library, framework, SDK, API, CLI tool, or cloud service.
- Add JSDoc only when it clarifies non-obvious public APIs, complex behavior, or important constraints.
- Prefer existing local patterns over new abstractions.
- Avoid broad refactors while fixing or adding a feed.
- Do not use `any`, `as`, or `@ts-ignore` unless the alternative is materially worse. Prefer `satisfies` for feed data.

## Common Commands

Run commands from the repository root unless noted.

```bash
# Development
bun run dev

# Production build for pkgs/rssbook
bun run build

# Typecheck + Biome check
bun run check

# Apply Biome fixes
bun run fix

# Main test suite: XSS scan + non-feed tests
bun run test

# Coverage for non-feed tests
bun run test:cov

# Test all feed routes
bun run source:test:all

# Create a new feed source
bun run source:new

# Test a selected feed source
bun run source:test
```

## Repository Layout

- `pkgs/rssbook/src/RSSBookApp.ts` creates the main Elysia app and wires plugins/routes.
- `pkgs/rssbook/src/index.ts` is the Bun entry point.
- `pkgs/rssbook/src/plugins/` contains error handling, logging, OpenAPI, rendering, dependency injection, initialization, and assets plugins.
- `pkgs/rssbook/src/routers/feeds/` contains source feeds grouped by category.
- `pkgs/rssbook/src/routers/utils/` contains utility routes such as fetch, filter, sort, union, intersection, and transform.
- `pkgs/rssbook/src/utils/` contains feed parsing/rendering utilities, cache, date helpers, HTML helpers, `Source`, and `Category`.
- `pkgs/rssbook/src/types/` contains shared data, source, route, meta, and theme types.
- Tests live next to their related source files, for example `src/utils/*.test.ts`, `src/utils/feeds/*.test.ts`, `src/types/*.test.ts`, and `src/routers/**/*.test.ts`.
- Runtime packages live in `platform/*`.

## Code Style

- Follow Biome formatting.
- Prefer descriptive names over comments. Add short comments only for non-obvious logic.
- Do not introduce new dependencies without checking existing utilities first.
- Keep public API and runtime compatibility in mind; `pkgs/rssbook` is consumed by runtime packages under `platform/`.
