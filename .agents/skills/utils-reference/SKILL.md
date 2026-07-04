---
name: utils-reference
description: RSSBook utility functions reference. Use this skill when users ask how to use cache, date, ofetch, filter, sort, union, parse, and other utility functions.
---

# RSSBook Utility Functions Reference

This skill provides detailed usage documentation for all utility functions in RSSBook.

## Table of Contents

1. [Cache](#cache)
2. [Date Parsing](#date-parsing)
3. [HTTP Requests (ofetch)](#http-requests-ofetch)
4. [HTML Parsing (load)](#html-parsing-load)
5. [HTML Formatting (formatHTML)](#html-formatting-formathtml)
6. [URL Processing (toAbsoluteURL)](#url-processing-toabsoluteurl)
7. [Feed Parsing (parse)](#feed-parsing-parse)
8. [Feed Filtering (filter)](#feed-filtering-filter)
9. [Feed Sorting (sort)](#feed-sorting-sort)
10. [Feed Merging (union)](#feed-merging-union)
11. [Feed Intersection (intersection)](#feed-intersection-intersection)

---

## Cache

Cache utility for storing and reusing data to avoid redundant requests.

### Basic Usage

```typescript
// Use in handler
async ({ cache }) => {
  const data = await cache.tryGet("cache-key", async () => {
    // Async function to fetch data
    return fetchedData;
  });
}
```

### API

| Method | Description |
| ------ | ----------- |
| `tryGet(key, fetcher, maxAgeMs?)` | Get cache, execute fetcher if not exists |
| `get(key)` | Get cache value |
| `set(key, value, maxAgeMs?)` | Set cache value |
| `del(key)` | Delete cache |

### Example

```typescript
// With custom expiration time (milliseconds)
const data = await cache.tryGet(
  `user:${userId}`,
  async () => await fetchUser(userId),
  5 * 60 * 1000  // 5 minutes
);
```

---

## Date Parsing

Universal date parser supporting multiple formats and relative time.

### Supported Formats

- ISO 8601: `2024-01-15T10:30:00Z`
- Common formats: `2024-01-15`, `2024/01/15`
- Unix timestamp: `1705312200`
- Relative time: `3 days ago`, `yesterday`, `2 hours ago`
- Chinese: `今天` (today), `昨天` (yesterday), `前天` (day before yesterday), `周一` (Monday)

### Usage

```typescript
async ({ date }) => {
  // Parse various formats
  date("2024-01-15");           // Date object
  date("3 days ago");           // Date from 3 days ago
  date("yesterday 10:30");      // Yesterday at 10:30
  date(1705312200);             // Unix timestamp

  // Specify timezone (hour offset)
  date("2024-01-15 10:00", +8); // UTC+8
}
```

---

## HTTP Requests (ofetch)

Enhanced fetch function with automatic retry and type inference.

### Usage

```typescript
async ({ ofetch }) => {
  // JSON response
  const json = await ofetch("https://api.example.com/data", {
    responseType: "json"
  });

  // HTML text
  const html = await ofetch("https://example.com", {
    responseType: "text"
  });

  // With headers
  const data = await ofetch(url, {
    headers: { Authorization: "Bearer token" },
    responseType: "json"
  });
}
```

### Configuration Options

| Option | Description | Default |
| ------ | ----------- | ------- |
| `responseType` | Response type (`json`/`text`/`blob`) | - |
| `headers` | Request headers | Preset UA |
| `timeout` | Timeout (milliseconds) | 8000 |
| `retry` | Retry count | 2 |

---

## HTML Parsing (load)

Cheerio-based HTML parser providing jQuery-like API.

### Usage

```typescript
async ({ load, ofetch }) => {
  const html = await ofetch(url, { responseType: "text" });
  const $ = load(html);

  // Select elements
  const title = $("h1.title").text();
  const href = $("a.link").attr("href");

  // Iterate list
  const items = $("article").toArray().map((el) => {
    const $el = $(el);
    return {
      title: $el.find("h2").text().trim(),
      link: $el.find("a").attr("href"),
    };
  });
}
```

### Common Methods

| Method | Description |
| ------ | ----------- |
| `$(selector)` | Select elements |
| `.text()` | Get text content |
| `.html()` | Get HTML content |
| `.attr(name)` | Get attribute value |
| `.find(selector)` | Find child elements |
| `.toArray()` | Convert to array |
| `.first()` / `.last()` | Get first/last element |
| `.parent()` / `.children()` | Parent/child elements |

---

## HTML Formatting (formatHTML)

Sanitizes and formats HTML content, removing dangerous tags and scripts.

### Usage

```typescript
async ({ formatHTML }) => {
  // Basic sanitization
  const clean = formatHTML(rawHtml);

  // With base URL (converts relative links to absolute)
  const cleanWithUrls = formatHTML(rawHtml, "https://example.com");
}
```

### Features

- Removes dangerous tags like `<script>`, `<style>`
- Preserves safe HTML tags (paragraphs, links, images, etc.)
- Automatically converts relative URLs to absolute URLs
- Cleans unsafe attributes

---

## URL Processing (toAbsoluteURL)

Converts relative URLs to absolute URLs.

### Usage

```typescript
async ({ toAbsoluteURL }) => {
  toAbsoluteURL("/path/to/page", "https://example.com");
  // => "https://example.com/path/to/page"

  toAbsoluteURL("../image.png", "https://example.com/blog/post");
  // => "https://example.com/image.png"

  toAbsoluteURL("https://other.com/page", "https://example.com");
  // => "https://other.com/page" (already absolute, unchanged)
}
```

---

## Feed Parsing (parse)

Parses RSS/Atom/JSON Feed content into standard Data format.

### Usage

```typescript
async ({ parse, ofetch }) => {
  // Parse RSS/Atom Feed
  const xml = await ofetch(feedUrl, { responseType: "text" });
  const data = parse(xml);  // Auto-detect format

  // Parse raw JSON data
  const jsonData = parse(jsonObject, "raw");
}
```

### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `content` | `string` | Feed XML content |
| `type` | `"rss"` / `"atom"` / `"raw"` | Format type (optional) |

---

## Feed Filtering (filter)

Filters Feed items by conditions.

### Using Preset Options

```typescript
import { filter } from "@/utils/feeds";

const filtered = filter(data, {
  keywords: {
    include: ["tech", "AI"],    // Include any keyword
    exclude: ["ads"],           // Exclude keywords
    caseSensitive: false,
  },
  date: {
    after: "2024-01-01",        // After this date
    before: "2024-12-31",       // Before this date
  },
  author: {
    include: ["John"],
    exclude: ["bot"],
  },
  categories: {
    include: ["tech"],
    exclude: ["entertainment"],
  },
  limit: {
    count: 10,                  // Limit count
    fromStart: true,            // Take from start
  },
});
```

### Using Custom Function

```typescript
const filtered = filter(data, (item, index) => {
  return item.title?.includes("important") && index < 20;
});
```

---

## Feed Sorting (sort)

Sorts Feed items.

### Sort by Date

```typescript
import { sort } from "@/utils/feeds";

// Sort by date descending (newest first, default)
const sorted = sort(data, "date", true);

// Sort by date ascending (oldest first)
const sortedAsc = sort(data, "date", false);
```

### Custom Sorting

```typescript
const sorted = sort(data, (a, b) => {
  return a.title.localeCompare(b.title);
});
```

---

## Feed Merging (union)

Merges multiple Feeds with automatic deduplication.

### Usage

```typescript
import { union } from "@/utils/feeds";

// Merge two Feeds
const merged = union(feed1, feed2);

// Merge multiple Feeds with custom metadata
const merged = union(
  baseFeed,
  [feed1, feed2, feed3],
  { title: "Combined Feed" },
  {
    hashFn: (item) => item.id || item.link,  // Custom dedup logic
  }
);
```

---

## Feed Intersection (intersection)

Gets common items from multiple Feeds.

### Usage

```typescript
import { intersection } from "@/utils/feeds";

// Get intersection of two Feeds
const common = intersection(feed1, feed2);

// Intersection of multiple Feeds
const common = intersection(
  baseFeed,
  [feed1, feed2],
  { title: "Common Articles" }
);
```
