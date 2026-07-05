# RSSBook Feed Route Reference

## File Placement

- Source file: `pkgs/rssbook/src/routers/feeds/{category}/{slug}/index.ts`
- Source test: `pkgs/rssbook/src/routers/feeds/{category}/{slug}/index.test.ts`
- Category registry: `pkgs/rssbook/src/routers/feeds/{category}/index.ts`

Use `bun source:new` to scaffold a Source from templates in `pkgs/rssbook/src/routers/feeds/_example` when that is faster than creating files manually. The scaffold is only a starting point; update metadata, routes, and tests to follow the rules below.

Register the Source:

```typescript
import { Category } from "@/utils";
import example from "./example";

export default new Category("school", "Educational resources and school-related news.").use({
	example,
});
```

## Route Design

- Every Feed route must be a GET route.
- Route paths are source-local, for example `"/www/:category"`.
- Full public path becomes `/feeds/{category}/{slug}{routePath}`.
- Use `t.Object(...)` schemas for params/query where useful.
- Return `Data` and use `satisfies Data`; map items with `satisfies DataItem`.

## Migrating Existing RSS Logic

When migrating from another RSS project:

1. Identify each old route and make one `.feed(...)` per route.
2. Replace direct `fetch` with handler `ofetch`.
3. Replace external `cheerio.load` imports with handler `load`.
4. Replace custom HTML cleaners with handler `formatHTML`.
5. Replace manual absolute URL construction with `toAbsoluteURL`.
6. Wrap network work in `cache.tryGet(cacheKey, async () => ...)`.
7. Keep file/external-link guards when fetching full article pages.
8. Return RSSBook `Data`; let `renderPlugin` produce RSS/Atom/JSON.

Example full-text enrichment:

```typescript
const items = await Promise.all(
	listItems.map(async (item) => {
		if (!shouldFetchArticle(item.link)) return item;

		try {
			const html = await ofetch(item.link, { responseType: "text" });
			const $ = load(html);
			const contentHTML = $("div.read").first().html();

			if (contentHTML) {
				item.description = formatHTML(contentHTML, item.link);
			}
		} catch {
			return item;
		}

		return item;
	}),
);
```

## Metadata and Naming

- Use English for all route metadata because route metadata is i18n-facing.
- Use English for:
  - `Source.title`
  - `Source.description`
  - route `title`
  - route `description`
  - param/query/config descriptions
- If a source site is not English, include the original name in description:

```typescript
new Source({
	description: "Official website and notices from Example University (示例大学).",
	domain: "example.edu",
	slug: "example-university",
	title: "Example University",
});
```

- Returned `Data.title`, `Data.description`, item titles, and item descriptions may stay in the source site's language.
- Keep maintainers as project/user names, not translated labels.

## Route Tests

Use `getRouteData` from `@/utils/tests/source`.

Helper signature:

```typescript
getRouteData(source, path, {
	config?: Record<string, string>;
	query?: Record<string, boolean | number | string | undefined>;
	type?: "raw" | "json";
});
```

Rules:

- One explicit `test(...)` per route.
- Do not loop over routes to create tests.
- Test route availability and returned `Data`, not Source metadata definitions.
- Prefer real pages for source tests when the route depends on live website structure.
- Use a longer timeout, usually `20_000`, for live website scraping.
- If Bun exits nonzero while all assertions pass, check `bunfig.toml`; this repo has coverage enabled with a threshold.
- Use `bun source:test` to run tests for modified Sources and `bun source:test:all` to run all Source tests.
- Default `bun test` ignores `pkgs/rssbook/src/routers/feeds/**`; do not rely on it to run Source route tests.

Example:

```typescript
import { describe, expect, test } from "bun:test";
import type { Data } from "@/types";
import { getRouteData } from "@/utils/tests/source";
import source from ".";

describe("Example University", () => {
	test("fetches official website news", async () => {
		const data = await getRouteData(source, "/news/1234");

		expectData(data);
	}, 20_000);

	test("fetches academic notices", async () => {
		const data = await getRouteData(source, "/notices/5678");

		expectData(data);
	}, 20_000);
});

function expectData(data: Data) {
	expect(data.title.length).toBeGreaterThan(0);
	expect(data.link).toStartWith("https://");
	expect(data.item?.length).toBeGreaterThan(0);
}
```

## Common Scraping Guards

Skip article-page enrichment for:

- Missing links
- File links such as PDF, Office files, images, archives, audio, and video
- External domains when the source only supports same-site pages

```typescript
const FILE_LINK_RE = /\.(pdf|docx?|xlsx?|xls|zip|rar|png|jpe?g|gif|bmp|mp4|mp3|txt)$/i;

function shouldFetchArticle(link: string, rootURL: string): boolean {
	if (!link || FILE_LINK_RE.test(link)) return false;

	try {
		return new URL(link).origin === new URL(rootURL).origin;
	} catch {
		return false;
	}
}
```
