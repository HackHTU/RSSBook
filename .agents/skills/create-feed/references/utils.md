# RSSBook Utility Reference

Use these utilities from the Feed handler context whenever possible:

```typescript
async ({ cache, date, formatHTML, load, ofetch, toAbsoluteURL }) => {
	// route logic
}
```

## Feed Context Properties

The handler function receives the following properties:

### Metadata

| Property | Type | Description |
| --- | --- | --- |
| `meta` | `object` | Source metadata object |
| `meta.slug` | `string` | Source slug identifier |
| `meta.title` | `string` | Source display title |
| `meta.description` | `string` | Source description (Markdown) |
| `meta.domain` | `string` | Source website domain |
| `meta.config` | `Record<string, string>` | Configuration values with defaults resolved |
| `lang` | `string` | Request language from Accept-Language header |

### Request Parameters

| Property | Type | Description |
| --- | --- | --- |
| `params` | `Record<string, string>` | Route parameters (`:param`) |
| `query` | `Record<string, string>` | Query parameters (`?key=value`) |
| `headers` | `Record<string, string>` | Request headers |

### Injected Utilities

| Property | Type | Description |
| --- | --- | --- |
| `cache` | `Cache` | Cache manager for storage-backed caching |
| `date` | `(...args) => Date` | Date parsing function |
| `ofetch` | `(url, options?) => Promise` | HTTP request function |
| `load` | `(html) => CheerioAPI` | HTML parsing function (Cheerio) |
| `formatHTML` | `(html, baseURL?) => string` | HTML sanitization function |
| `toAbsoluteURL` | `(url, baseURL) => string` | URL conversion function |
| `parse` | `(data, type?) => Data` | Feed parsing function |
| `logger` | `Logger` | Logging utility |
| `uuid` | `() => string` | UUID generation function |
| `config` | `Record<string, string>` | Raw configuration from request |

## Cache

Cache stores and reuses expensive fetch results.

```typescript
const data = await cache.tryGet("cache-key", async () => {
	return fetchedData;
});
```

Useful methods:

| Method | Description |
| --- | --- |
| `tryGet(key, fetcher, maxAgeMs?)` | Get cached value or execute `fetcher` |
| `get(key)` | Read cached value |
| `set(key, value, maxAgeMs?)` | Store cached value |
| `del(key)` | Delete cached value |

With custom expiration:

```typescript
const data = await cache.tryGet(
	`user:${userId}`,
	async () => await fetchUser(userId),
	5 * 60 * 1000,
);
```

## Date Parsing

`date(...)` returns a `Date` object. It supports ISO strings, common date strings, timestamps, relative English text, and Chinese relative dates.

```typescript
date("2024-01-15");
date("2024/01/15");
date("3 days ago");
date("昨天");
date(1705312200);
date("2024-01-15 10:00", +8);
```

## HTTP Requests: ofetch

Use handler `ofetch` instead of direct `fetch`.

```typescript
const json = await ofetch("https://api.example.com/data", {
	responseType: "json",
});

const html = await ofetch("https://example.com", {
	responseType: "text",
});

const data = await ofetch(url, {
	headers: { Authorization: "Bearer token" },
	responseType: "json",
});
```

Defaults include RSSBook user agent, retry, logging, and timeout behavior.

## HTML Parsing: load

`load` is Cheerio-based.

```typescript
const html = await ofetch(url, { responseType: "text" });
const $ = load(html);

const items = $("article")
	.toArray()
	.map((el) => {
		const $el = $(el);
		return {
			link: $el.find("a").attr("href"),
			title: $el.find("h2").text().trim(),
		};
	});
```

Common methods: `$(selector)`, `.text()`, `.html()`, `.attr(name)`, `.find(selector)`, `.toArray()`, `.first()`, `.last()`, `.parent()`, `.children()`.

## HTML Formatting: formatHTML

`formatHTML` sanitizes HTML and can convert relative links to absolute URLs.

```typescript
const clean = formatHTML(rawHtml);
const cleanWithUrls = formatHTML(rawHtml, "https://example.com/post");
```

It removes dangerous tags and attributes while preserving safe content tags, links, images, tables, media, and basic formatting.

## URL Processing: toAbsoluteURL

```typescript
toAbsoluteURL("/path/to/page", "https://example.com");
toAbsoluteURL("../image.png", "https://example.com/blog/post");
toAbsoluteURL("https://other.com/page", "https://example.com");
```

## Feed Parsing: parse

Use `parse` when the upstream already has RSS, Atom, JSON Feed, or raw structured feed data.

```typescript
const xml = await ofetch(feedUrl, { responseType: "text" });
const data = parse(xml);

const dataFromJson = parse(jsonObject, "raw");
```

## Feed Filtering: filter

```typescript
import { filter } from "@/utils/feeds";

const filtered = filter(data, {
	author: {
		include: ["John"],
	},
	categories: {
		exclude: ["ads"],
		include: ["tech"],
	},
	date: {
		after: "2024-01-01",
		before: "2024-12-31",
	},
	keywords: {
		caseSensitive: false,
		exclude: ["sponsored"],
		include: ["AI"],
	},
	limit: {
		count: 10,
		fromStart: true,
	},
});

const custom = filter(data, (item, index) => item.title?.includes("important") && index < 20);
```

## Feed Sorting: sort

```typescript
import { sort } from "@/utils/feeds";

const newestFirst = sort(data, "date", true);
const oldestFirst = sort(data, "date", false);
const byTitle = sort(data, (a, b) => a.title.localeCompare(b.title));
```

## Feed Merging: union

```typescript
import { union } from "@/utils/feeds";

const merged = union(feed1, feed2);

const mergedWithMetadata = union(
	baseFeed,
	[feed1, feed2, feed3],
	{ title: "Combined Feed" },
	{
		hashFn: (item) => item.id || item.link,
	},
);
```

## Feed Intersection: intersection

```typescript
import { intersection } from "@/utils/feeds";

const common = intersection(feed1, feed2);

const commonWithMetadata = intersection(baseFeed, [feed1, feed2], {
	title: "Common Articles",
});
```
