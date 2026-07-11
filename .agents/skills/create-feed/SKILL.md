---
name: create-feed
description: Create or update RSSBook Feed sources and routes, including Source metadata, route handlers, scraping logic, route tests, and RSSBook utility usage such as cache, date, ofetch, load, formatHTML, parse, filter, sort, union, and intersection.
---

# Create RSSBook Feeds

Use this skill when adding or updating a Feed route in RSSBook, migrating route logic from another RSS project, scraping a website, or testing a Source route.

## Core Workflow

1. Read nearby routes in the target category and follow local patterns.
2. Create the Source at `pkgs/rssbook/src/routers/feeds/{category}/{slug}/index.ts`; use `bun source:new` when scaffolding from an existing template is useful.
3. Register it in `pkgs/rssbook/src/routers/feeds/{category}/index.ts`.
4. Use RSSBook utilities from the handler context instead of importing alternate fetch/parser stacks.
5. In `route_handler`, prefer predefined errors from `@/utils/error` over `new Error(...)` so the global handler can map `status`, `code`, and `retryable` consistently.
6. When a route fails because of invalid input, missing upstream content, browser availability, cache misses, or parse/render issues, choose the closest existing `RSSBookError` subclass first; add a new one in `@/utils/error` only when no existing code fits.
7. Add one explicit route test per Feed route.
8. Run formatting and TypeScript. Run source route tests with `bun source:test` or `bun source:test:all` only when route network checks are intended.

## Feed Development Checklist

- Use the core pattern `new Source(...).feed(meta, (app) => app.get(...))`.
- Place a source at `pkgs/rssbook/src/routers/feeds/{category}/{slug}/index.ts`.
- Register it in `pkgs/rssbook/src/routers/feeds/{category}/index.ts`.
- Use lowercase kebab-case source slugs.
- Use GET routes for feed handlers.
- Return `Data` and validate with `satisfies Data`.
- Use `cache.tryGet()` around network-heavy or scrape-heavy work.
- Use injected `ofetch`, `parse`, `date`, `load`, `formatHTML`, `toAbsoluteURL`, and other handler-context utilities when available.
- Keep source-specific tests beside the source when adding meaningful behavior.

## Required References

Read only the references needed for the task:

- New Source structure, route migration patterns, metadata naming, and route testing: [references/feed-routes.md](references/feed-routes.md)
- RSSBook utility APIs (`cache`, `date`, `ofetch`, `load`, `formatHTML`, feed transforms): [references/utils.md](references/utils.md)
- Browser routes, bounded page concurrency, lifecycle, cookies, response waits, resource filtering, and fingerprint consistency: [references/browser.md](references/browser.md)
- RSSBook error catalog and where to use each error: [references/errors.md](references/errors.md)

## Source Shape

```typescript
import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

export default new Source({
	description: "Official news and notices from Example University (示例大学).",
	domain: "example.edu",
	slug: "example-university",
	title: "Example University",
}).feed(
	{
		description: "Fetch latest notices from a specified website category.",
		fulltext: true,
		language: "zh-CN",
		maintainer: { name: "RSSBook" },
		title: "Latest Notices",
		withImage: "If-Present",
	},
	(app) =>
		app.get(
			"/notices/:category",
			async ({ cache, date, formatHTML, load, ofetch, params, toAbsoluteURL }) => {
				return data satisfies Data;
			},
			{
				params: t.Object({
					category: t.String({
						description: "Website category ID, for example 1234.",
					}),
				}),
			},
		),
);
```

For a minimal route without params:

```typescript
import type { Data } from "@/types";
import { Source } from "@/utils";

export default new Source({
	description: "Example feed source.",
	domain: "example.com",
	slug: "example",
	title: "Example",
}).feed(
	{
		description: "Latest items from Example.",
		title: "Example Feed",
	},
	(app) =>
		app.get("/latest", async ({ cache, meta: { domain } }) =>
			cache.tryGet("example:latest", async () => {
				return { title: "Example Feed", link: `https://${domain}`, item: [] } satisfies Data;
			}),
		),
);
```

## Data And Utilities

Use `pkgs/rssbook/src/types/data.ts` as the source of truth. Feed handlers return `Data`; items should include stable `title`, `link`, and, when possible, `id` and `date`. Prefer absolute links.

Common utilities are exported from `@/utils` and often injected into handler context:

- `parse()` for RSS, Atom, JSON Feed, and raw data parsing.
- `render()` for output generation.
- `filter()`, `sort()`, `union()`, and `intersection()` for feed operations.
- `load()` for HTML parsing.
- `formatHTML()` for sanitizing and normalizing HTML fragments.
- `toAbsoluteURL()` for link normalization.
- `Cache` / `cache.tryGet()` for storage-backed caching.

### Feed Context Properties

The handler function receives these properties:

- **Metadata**: `meta` (source metadata including `slug`, `title`, `description`, `domain`, `config`), `lang` (request language)
- **Request**: `params` (route parameters), `query` (query parameters), `headers` (request headers)
- **Utilities**: `cache`, `date`, `ofetch`, `load`, `formatHTML`, `toAbsoluteURL`, `parse`, `logger`, `uuid`, `config`
- **Browser**: `browser` for routes whose Feed metadata declares `browser: true`; read [references/browser.md](references/browser.md) before using it

## Metadata Rules

- Use English for `Source.title`, route `title`, route `description`, parameter descriptions, and config descriptions.
- If the website is primarily in another language, mention the native name in `description`, for example `Example University (示例大学)`.
- Keep `slug` lowercase hyphen-case and matching the folder name.
- Keep returned Feed item content in the source language. Only route metadata needs to be English/i18n-friendly.

## Testing Rules

- Put tests beside the Source, for example `pkgs/rssbook/src/routers/feeds/school/example-university/index.test.ts`.
- Use `getRouteData` from `@/utils/tests/source`.
- Write one explicit `test(...)` per route. Do not generate route tests with a loop.
- Route tests should verify the route returns valid `Data` from a real page; do not test Source metadata directly.
- Default `bun test` intentionally ignores `pkgs/rssbook/src/routers/feeds/**`; use the source scripts for route tests.

```typescript
import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import source from ".";

describe("Example University", () => {
	test("fetches latest notices", async () => {
		const data = await getRouteData(source, "/notices/1234");

		expect(data.title).toContain("Example University");
		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);
});
```

## Project Scripts

- `bun source:new`: interactive Source scaffold. It copies a template from `pkgs/rssbook/src/routers/feeds/_example` into `pkgs/rssbook/src/routers/feeds/{category}/{slug}`. After scaffolding, update metadata, register the Source in the category `index.ts`, and write colocated route tests in `index.test.ts`.
- `bun source:test`: finds modified Sources under `pkgs/rssbook/src/routers/feeds/**` using git status, including untracked files, and runs each modified Source's colocated `index.test.ts`. If a Source has no test file, it offers to create a `getRouteData`-based template.
- `bun source:test:all`: runs all Source tests under `pkgs/rssbook/src/routers/feeds`.
- `bun test`: runs non-Source tests and ignores `pkgs/rssbook/src/routers/feeds/**`, because Source route tests often depend on real network conditions.
