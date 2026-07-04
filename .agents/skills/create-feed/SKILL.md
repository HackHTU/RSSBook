---
name: create-feed
description: Create new RSS Feed sources. Use this skill when users want to add new data sources, create Feed routes, or ask how to scrape website data.
---

# Creating a New Feed Guide

This skill helps you create new RSS Feed sources in the RSSBook project.

## Core Concepts

### 1. Source (Data Source)

A Source is a data source definition, representing a website or service (e.g., GitHub, Twitter). Each Source can contain multiple Feeds.

**File Location**: `src/routers/feeds/{category}/{slug}/index.ts`

### 2. Feed

A Feed is a specific route under a Source, defining how to fetch and return data.

### 3. Category

A Category organizes multiple Sources, such as `programming`, `news`, `blog`, etc.

## Creation Steps

### Step 1: Determine Category and Slug

- **Category**: Choose an existing category or create a new one
- **Slug**: Lowercase letters and hyphens, e.g., `my-source`

### Step 2: Create Source File

Create a file at `src/routers/feeds/{category}/{slug}/index.ts`:

```typescript
import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

export default new Source({
  slug: "example-source",  // Must match the folder name
  title: "Example Source",
  description: "Brief description of this data source",
  domain: "example.com",   // Domain of the source website
  config: {
    // Optional: required configuration parameters
    API_KEY: {
      description: "API Key",
      required: true,
      default: "your-default-key",
    },
  },
}).feed(
  {
    title: "Feed Title",
    description: "Detailed description of the Feed (supports Markdown)",
    fulltext: true,
    language: ["zh-CN", "en"],
    maintainer: { name: "Your Name" },
    withImage: "If-Present",
  },
  (app) => app.get("/path/:param", async (context) => {
    // Fetching logic
    return data satisfies Data;
  }),
);
```

### Step 3: Register to Category

Register in `src/routers/feeds/{category}/index.ts`:

```typescript
import { Category } from "@/utils";
import mySource from "./my-source";

export default new Category("category-name", "Category description").use({
  mySource,
});
```

## Handler Context

The context object received by the handler function contains:

### Props

| Property | Description |
|----------|-------------|
| `meta` | Metadata for the source and Feed (domain, config, title, etc.) |
| `params` | Route parameters (e.g., `:username`) |
| `query` | Query parameters |
| `lang` | Request language (parsed from Accept-Language) |

### Functions

| Function | Description |
|----------|-------------|
| `cache` | Cache object, use `cache.tryGet(key, fn)` |
| `date` | Date parsing function |
| `ofetch` | Enhanced fetch function |
| `load` | HTML parser (jQuery-like) |
| `formatHTML` | HTML cleanup and formatting |
| `toAbsoluteURL` | Relative URL to absolute URL |
| `parse` | Parse RSS/Atom Feed |
| `logger` | Logging tool |

## Data Type Structure

The returned data must conform to the `Data` type:

```typescript
interface Data {
  title: string;           // Feed title
  link: string;            // Feed link
  description?: string;    // Feed description
  language?: string;       // Language code
  item?: DataItem[];       // Feed items
  updated?: Date;          // Update time
}

interface DataItem {
  title: string;           // Item title
  link: string;            // Item link
  description?: string;    // Summary
  content?: string;        // Full text content
  date?: Date;             // Publication date
  author?: Author[];       // Authors
  category?: Category[];   // Categories
  image?: string;          // Image
  id?: string;             // Unique identifier
}
```

## Example: API Data Source

```typescript
export default new Source({
  slug: "github",
  title: "GitHub",
  description: "GitHub code hosting platform",
  domain: "github.com",
}).feed(
  {
    title: "User Events",
    description: "Fetch GitHub user activity events",
    language: ["en"],
    maintainer: { name: "RSSBook" },
  },
  (app) => app.get(
    "/events/:username",
    async ({ params: { username }, cache, date, ofetch, meta: { domain } }) => {
      const link = `https://api.${domain}/users/${username}/events`;

      const items = await cache.tryGet(link, async (url) => {
        const events = await ofetch(url, { responseType: "json" });
        return events.map((event) => ({
          title: event.title,
          link: event.url,
          date: date(event.created_at),
          description: event.description,
        } satisfies DataItem));
      });

      return {
        title: `GitHub Events - ${username}`,
        link,
        item: items,
      } satisfies Data;
    },
    {
      params: t.Object({
        username: t.String({ description: "GitHub username" }),
      }),
    },
  ),
);
```

## Example: HTML Web Scraping

```typescript
export default new Source({
  slug: "blog",
  title: "Blog",
  description: "Blog website",
  domain: "blog.example.com",
}).feed(
  {
    title: "Latest Articles",
    description: "Fetch latest blog articles",
    fulltext: true,
    language: ["zh-CN"],
    maintainer: { name: "RSSBook" },
  },
  (app) => app.get(
    "/",
    async ({ cache, date, ofetch, load, formatHTML, toAbsoluteURL, meta: { domain } }) => {
      const rootURL = `https://${domain}`;

      const items = await cache.tryGet(rootURL, async (url) => {
        const html = await ofetch(url, { responseType: "text" });
        const $ = load(html);

        return $("article.post").toArray().map((el) => {
          const $el = $(el);
          return {
            title: $el.find("h2").text().trim(),
            link: toAbsoluteURL($el.find("a").attr("href") || "", rootURL),
            date: date($el.find(".date").text()),
            description: $el.find(".excerpt").text().trim(),
          } satisfies DataItem;
        });
      });

      return {
        title: "Blog Latest Articles",
        link: rootURL,
        item: items,
      } satisfies Data;
    },
  ),
);
```

## Best Practices

1. **Use Cache**: Always use `cache.tryGet()` to avoid repeated requests
2. **Type Safety**: Use `satisfies Data` and `satisfies DataItem` to ensure type correctness
3. **Error Handling**: Use try-catch when fetching full text content
4. **Concurrent Requests**: Use `Promise.all()` to fetch multiple pages concurrently
5. **URL Handling**: Use `toAbsoluteURL()` for relative links
6. **HTML Cleanup**: Use `formatHTML()` to clean HTML content
