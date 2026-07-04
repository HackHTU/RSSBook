---
name: source-handler
description: Detailed reference for Source class and Handler context. Use this skill when users ask about Source configuration, Handler parameters, route definitions, or Feed metadata.
---

# Source and Handler Reference

This skill provides detailed documentation for the Source class configuration and Handler context object.

## Source Class

Source defines a data source, containing basic information and multiple Feeds.

### Constructor Parameters

```typescript
new Source({
  slug: string,           // Unique identifier (lowercase letters and hyphens)
  title: string,          // Display title
  description: string,    // Description (supports Markdown)
  domain: string,         // Source website domain
  config?: {              // Optional configuration parameters
    [key: string]: {
      description: string,
      required?: boolean,
      default?: string,
    }
  }
})
```

### slug Naming Rules

- Can only contain lowercase letters, numbers, and hyphens
- Must start with a letter
- Examples: `github`, `hacker-news`, `v2ex`

---

## feed() Method

Adds a Feed route to a Source.

### Parameters

```typescript
source.feed(
  routeConfig: RouteConfig,
  handler: (app) => app.get(path, handlerFn, schema?)
)
```

### RouteConfig Configuration

| Field | Type | Description |
| ---- | ---- | ---- |
| `title` | `string` | Feed title |
| `description` | `string` | Detailed description (Markdown) |
| `fulltext` | `boolean` | Whether to fetch full text |
| `language` | `string[]` | Supported languages |
| `maintainer` | `object` | Maintainer information |
| `withImage` | `string` | Image strategy |

---

## Handler Context

The complete context object received by Handler functions.

### Props

```typescript
async ({
  // Metadata
  meta: {
    slug,        // Source slug
    title,       // Source title
    description, // Source description
    domain,      // Domain name
    config,      // Configuration values (with defaults resolved)
  },

  // Request parameters
  params,        // Route parameters (:param)
  query,         // Query parameters (?key=value)
  lang,          // Request language
  headers,       // Request headers
}) => { ... }
```

### Injected Functions

| Function | Description |
| ---- | ---- |
| `cache` | Cache manager |
| `date` | Date parsing |
| `ofetch` | HTTP requests |
| `load` | HTML parsing |
| `formatHTML` | HTML sanitization |
| `toAbsoluteURL` | URL conversion |
| `parse` | Feed parsing |
| `logger` | Logging utility |

---

## Route Schema Definition

Use the `t` object to define route parameter types.

```typescript
import { t } from "@/utils";

app.get(
  "/user/:username/repo/:repo",
  handler,
  {
    params: t.Object({
      username: t.String({
        description: "Username",
        examples: ["octocat"],
      }),
      repo: t.String({
        description: "Repository name",
      }),
    }),
  }
)
```

### Common Types

| Type | Description |
| ---- | ---- |
| `t.String()` | String |
| `t.Number()` | Number |
| `t.Boolean()` | Boolean |
| `t.Optional()` | Optional parameter |
| `t.UnionEnum([])` | Enum value |

---

## Complete Example

```typescript
import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

export default new Source({
  slug: "example",
  title: "Example",
  description: "Example data source",
  domain: "example.com",
  config: {
    API_KEY: {
      description: "API key",
      required: false,
      default: "demo-key",
    },
  },
}).feed(
  {
    title: "Latest Content",
    description: "Fetch latest content list",
    fulltext: true,
    language: ["en"],
    maintainer: { name: "Your Name" },
  },
  (app) => app.get(
    "/latest/:category",
    async ({
      meta: { domain, config },
      params: { category },
      cache,
      date,
      ofetch,
    }) => {
      const url = `https://api.${domain}/${category}`;

      const items = await cache.tryGet(url, async () => {
        const res = await ofetch(url, {
          headers: { Authorization: config.API_KEY },
          responseType: "json",
        });

        return res.map((item) => ({
          title: item.title,
          link: item.url,
          date: date(item.created_at),
          description: item.summary,
        } satisfies DataItem));
      });

      return {
        title: `Example - ${category}`,
        link: url,
        item: items,
      } satisfies Data;
    },
    {
      params: t.Object({
        category: t.UnionEnum(["news", "blog"], {
          description: "Content category",
        }),
      }),
    },
  ),
);
```
