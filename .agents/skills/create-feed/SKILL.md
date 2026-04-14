---
name: create-feed
description: 创建新的 RSS Feed 源。当用户想要添加新的数据源、创建 Feed 路由、或询问如何抓取网站数据时使用此技能。
---

# 创建新 Feed 指南

本技能帮助你在 RSSBook 项目中创建新的 RSS Feed 源。

## 核心概念

### 1. Source（数据源）

Source 是一个数据源的定义，代表一个网站或服务（如 GitHub、Twitter）。每个 Source 可以包含多个 Feed。

**文件位置**: `src/routers/feeds/{category}/{slug}/index.ts`

### 2. Feed（订阅源）

Feed 是 Source 下的具体路由，定义了如何抓取和返回数据。

### 3. Category（分类）

Category 将多个 Source 组织在一起，如 `programming`、`news`、`blog` 等。

## 创建步骤

### 步骤 1：确定分类和 slug

- **分类**: 选择现有分类或创建新分类
- **slug**: 小写字母和短横线，如 `my-source`

### 步骤 2：创建 Source 文件

在 `src/routers/feeds/{category}/{slug}/index.ts` 创建文件：

```typescript
import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

export default new Source({
  slug: "example-source",  // 必须与文件夹名一致
  title: "Example Source",
  description: "简短描述这个数据源",
  domain: "example.com",   // 源网站的域名
  config: {
    // 可选：需要的配置参数
    API_KEY: {
      description: "API 密钥",
      required: true,
      default: "your-default-key",
    },
  },
}).feed(
  {
    title: "Feed 标题",
    description: "Feed 的详细描述（支持 Markdown）",
    fulltext: true,
    language: ["zh-CN", "en"],
    maintainer: { name: "Your Name" },
    withImage: "If-Present",
  },
  (app) => app.get("/path/:param", async (context) => {
    // 抓取逻辑
    return data satisfies Data;
  }),
);
```

### 步骤 3：注册到 Category

在 `src/routers/feeds/{category}/index.ts` 中注册：

```typescript
import { Category } from "@/utils";
import mySource from "./my-source";

export default new Category("category-name", "分类描述").use({
  mySource,
});
```

## Handler 上下文

Handler 函数接收的上下文对象包含：

### Props（属性）

| 属性 | 说明 |
|------|------|
| `meta` | 源和 Feed 的元数据（domain、config、title 等） |
| `params` | 路由参数（如 `:username`） |
| `query` | 查询参数 |
| `lang` | 请求语言（从 Accept-Language 解析） |

### Functions（函数）

| 函数 | 说明 |
|------|------|
| `cache` | 缓存对象，使用 `cache.tryGet(key, fn)` |
| `date` | 日期解析函数 |
| `ofetch` | 增强的 fetch 函数 |
| `load` | HTML 解析器（类似 jQuery） |
| `formatHTML` | HTML 清理和格式化 |
| `toAbsoluteURL` | 相对 URL 转绝对 URL |
| `parse` | 解析 RSS/Atom Feed |
| `logger` | 日志工具 |

## Data 类型结构

返回的数据必须符合 `Data` 类型：

```typescript
interface Data {
  title: string;           // Feed 标题
  link: string;            // Feed 链接
  description?: string;    // Feed 描述
  language?: string;       // 语言代码
  item?: DataItem[];       // Feed 条目
  updated?: Date;          // 更新时间
}

interface DataItem {
  title: string;           // 条目标题
  link: string;            // 条目链接
  description?: string;    // 摘要
  content?: string;        // 全文内容
  date?: Date;             // 发布日期
  author?: Author[];       // 作者
  category?: Category[];   // 分类
  image?: string;          // 图片
  id?: string;             // 唯一标识
}
```

## 示例：API 数据源

```typescript
export default new Source({
  slug: "github",
  title: "GitHub",
  description: "GitHub 代码托管平台",
  domain: "github.com",
}).feed(
  {
    title: "用户事件",
    description: "获取 GitHub 用户的活动事件",
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
        username: t.String({ description: "GitHub 用户名" }),
      }),
    },
  ),
);
```

## 示例：HTML 网页抓取

```typescript
export default new Source({
  slug: "blog",
  title: "Blog",
  description: "博客网站",
  domain: "blog.example.com",
}).feed(
  {
    title: "最新文章",
    description: "获取博客最新文章",
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
        title: "Blog 最新文章",
        link: rootURL,
        item: items,
      } satisfies Data;
    },
  ),
);
```

## 最佳实践

1. **使用缓存**: 始终使用 `cache.tryGet()` 避免重复请求
2. **类型安全**: 使用 `satisfies Data` 和 `satisfies DataItem` 确保类型正确
3. **错误处理**: 在抓取全文时使用 try-catch
4. **并发请求**: 使用 `Promise.all()` 并发获取多个页面
5. **URL 处理**: 使用 `toAbsoluteURL()` 处理相对链接
6. **HTML 清理**: 使用 `formatHTML()` 清理 HTML 内容
