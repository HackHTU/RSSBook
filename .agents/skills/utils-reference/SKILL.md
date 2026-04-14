---
name: utils-reference
description: RSSBook 工具函数参考。当用户询问如何使用 cache、date、ofetch、filter、sort、union、parse 等工具函数时使用此技能。
---

# RSSBook 工具函数参考

本技能提供 RSSBook 中所有工具函数的详细使用说明。

## 目录

1. [缓存 (Cache)](#缓存-cache)
2. [日期解析 (date)](#日期解析-date)
3. [HTTP 请求 (ofetch)](#http-请求-ofetch)
4. [HTML 解析 (load)](#html-解析-load)
5. [HTML 格式化 (formatHTML)](#html-格式化-formathtml)
6. [URL 处理 (toAbsoluteURL)](#url-处理-toabsoluteurl)
7. [Feed 解析 (parse)](#feed-解析-parse)
8. [Feed 过滤 (filter)](#feed-过滤-filter)
9. [Feed 排序 (sort)](#feed-排序-sort)
10. [Feed 合并 (union)](#feed-合并-union)
11. [Feed 交集 (intersection)](#feed-交集-intersection)

---

## 缓存 (Cache)

缓存工具用于存储和复用数据，避免重复请求。

### 基本用法

```typescript
// 在 handler 中使用
async ({ cache }) => {
  const data = await cache.tryGet("cache-key", async () => {
    // 获取数据的异步函数
    return fetchedData;
  });
}
```

### API

| 方法 | 说明 |
|------|------|
| `tryGet(key, fetcher, maxAgeMs?)` | 获取缓存，不存在则执行 fetcher |
| `get(key)` | 获取缓存值 |
| `set(key, value, maxAgeMs?)` | 设置缓存 |
| `del(key)` | 删除缓存 |

### 示例

```typescript
// 带自定义过期时间（毫秒）
const data = await cache.tryGet(
  `user:${userId}`,
  async () => await fetchUser(userId),
  5 * 60 * 1000  // 5 分钟
);
```

---

## 日期解析 (date)

通用日期解析器，支持多种格式和相对时间。

### 支持的格式

- ISO 8601: `2024-01-15T10:30:00Z`
- 常见格式: `2024-01-15`, `2024/01/15`
- Unix 时间戳: `1705312200`
- 相对时间: `3天前`, `yesterday`, `2 hours ago`
- 中文: `今天`, `昨天`, `前天`, `周一`

### 用法

```typescript
async ({ date }) => {
  // 解析各种格式
  date("2024-01-15");           // Date 对象
  date("3天前");                 // 3 天前的 Date
  date("yesterday 10:30");      // 昨天 10:30
  date(1705312200);             // Unix 时间戳

  // 指定时区（小时偏移）
  date("2024-01-15 10:00", +8); // UTC+8
}
```

---

## HTTP 请求 (ofetch)

增强的 fetch 函数，支持自动重试和类型推断。

### 用法

```typescript
async ({ ofetch }) => {
  // JSON 响应
  const json = await ofetch("https://api.example.com/data", {
    responseType: "json"
  });

  // HTML 文本
  const html = await ofetch("https://example.com", {
    responseType: "text"
  });

  // 带请求头
  const data = await ofetch(url, {
    headers: { Authorization: "Bearer token" },
    responseType: "json"
  });
}
```

### 配置选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `responseType` | 响应类型 (`json`/`text`/`blob`) | - |
| `headers` | 请求头 | 预设 UA |
| `timeout` | 超时时间（毫秒） | 8000 |
| `retry` | 重试次数 | 2 |

---

## HTML 解析 (load)

基于 Cheerio 的 HTML 解析器，提供类似 jQuery 的 API。

### 用法

```typescript
async ({ load, ofetch }) => {
  const html = await ofetch(url, { responseType: "text" });
  const $ = load(html);

  // 选择元素
  const title = $("h1.title").text();
  const href = $("a.link").attr("href");

  // 遍历列表
  const items = $("article").toArray().map((el) => {
    const $el = $(el);
    return {
      title: $el.find("h2").text().trim(),
      link: $el.find("a").attr("href"),
    };
  });
}
```

### 常用方法

| 方法 | 说明 |
|------|------|
| `$(selector)` | 选择元素 |
| `.text()` | 获取文本内容 |
| `.html()` | 获取 HTML 内容 |
| `.attr(name)` | 获取属性值 |
| `.find(selector)` | 查找子元素 |
| `.toArray()` | 转换为数组 |
| `.first()` / `.last()` | 获取首/末元素 |
| `.parent()` / `.children()` | 父/子元素 |

---

## HTML 格式化 (formatHTML)

清理和格式化 HTML 内容，移除危险标签和脚本。

### 用法

```typescript
async ({ formatHTML }) => {
  // 基本清理
  const clean = formatHTML(rawHtml);

  // 指定基础 URL（转换相对链接为绝对链接）
  const cleanWithUrls = formatHTML(rawHtml, "https://example.com");
}
```

### 功能

- 移除 `<script>`、`<style>` 等危险标签
- 保留安全的 HTML 标签（段落、链接、图片等）
- 自动转换相对 URL 为绝对 URL
- 清理不安全的属性

---

## URL 处理 (toAbsoluteURL)

将相对 URL 转换为绝对 URL。

### 用法

```typescript
async ({ toAbsoluteURL }) => {
  toAbsoluteURL("/path/to/page", "https://example.com");
  // => "https://example.com/path/to/page"

  toAbsoluteURL("../image.png", "https://example.com/blog/post");
  // => "https://example.com/image.png"

  toAbsoluteURL("https://other.com/page", "https://example.com");
  // => "https://other.com/page" (已是绝对 URL，不变)
}
```

---

## Feed 解析 (parse)

解析 RSS/Atom/JSON Feed 内容为标准 Data 格式。

### 用法

```typescript
async ({ parse, ofetch }) => {
  // 解析 RSS/Atom Feed
  const xml = await ofetch(feedUrl, { responseType: "text" });
  const data = parse(xml);  // 自动检测格式

  // 解析原始 JSON 数据
  const jsonData = parse(jsonObject, "raw");
}
```

### 参数

| 参数 | 类型 | 说明 |
| ---- | ---- | ---- |
| `content` | `string` | Feed XML 内容 |
| `type` | `"rss"` / `"atom"` / `"raw"` | 格式类型（可选） |

---

## Feed 过滤 (filter)

按条件过滤 Feed 条目。

### 使用预设选项

```typescript
import { filter } from "@/utils/feeds";

const filtered = filter(data, {
  keywords: {
    include: ["技术", "AI"],    // 包含任一关键词
    exclude: ["广告"],          // 排除关键词
    caseSensitive: false,
  },
  date: {
    after: "2024-01-01",       // 此日期之后
    before: "2024-12-31",      // 此日期之前
  },
  author: {
    include: ["张三"],
    exclude: ["机器人"],
  },
  categories: {
    include: ["技术"],
    exclude: ["娱乐"],
  },
  limit: {
    count: 10,                 // 限制数量
    fromStart: true,           // 从开头取
  },
});
```

### 使用自定义函数

```typescript
const filtered = filter(data, (item, index) => {
  return item.title?.includes("重要") && index < 20;
});
```

---

## Feed 排序 (sort)

对 Feed 条目进行排序。

### 按日期排序

```typescript
import { sort } from "@/utils/feeds";

// 按日期降序（最新在前，默认）
const sorted = sort(data, "date", true);

// 按日期升序（最旧在前）
const sortedAsc = sort(data, "date", false);
```

### 自定义排序

```typescript
const sorted = sort(data, (a, b) => {
  return a.title.localeCompare(b.title);
});
```

---

## Feed 合并 (union)

合并多个 Feed，自动去重。

### 用法

```typescript
import { union } from "@/utils/feeds";

// 合并两个 Feed
const merged = union(feed1, feed2);

// 合并多个 Feed，自定义元数据
const merged = union(
  baseFeed,
  [feed1, feed2, feed3],
  { title: "合并订阅源" },
  {
    hashFn: (item) => item.id || item.link,  // 自定义去重逻辑
  }
);
```

---

## Feed 交集 (intersection)

获取多个 Feed 的共同条目。

### 用法

```typescript
import { intersection } from "@/utils/feeds";

// 获取两个 Feed 的交集
const common = intersection(feed1, feed2);

// 多个 Feed 的交集
const common = intersection(
  baseFeed,
  [feed1, feed2],
  { title: "共同文章" }
);
```
