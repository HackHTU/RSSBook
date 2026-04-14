---
name: source-handler
description: Source 类和 Handler 上下文详细参考。当用户询问 Source 配置、Handler 参数、路由定义或 Feed 元数据时使用此技能。
---

# Source 和 Handler 参考

本技能详细说明 Source 类的配置和 Handler 上下文对象。

## Source 类

Source 定义一个数据源，包含基本信息和多个 Feed。

### 构造函数参数

```typescript
new Source({
  slug: string,           // 唯一标识符（小写字母和短横线）
  title: string,          // 显示标题
  description: string,    // 描述（支持 Markdown）
  domain: string,         // 源网站域名
  config?: {              // 可选配置参数
    [key: string]: {
      description: string,
      required?: boolean,
      default?: string,
    }
  }
})
```

### slug 命名规则

- 只能包含小写字母、数字和短横线
- 必须以字母开头
- 示例：`github`, `hacker-news`, `v2ex`

---

## feed() 方法

为 Source 添加一个 Feed 路由。

### 参数

```typescript
source.feed(
  routeConfig: RouteConfig,
  handler: (app) => app.get(path, handlerFn, schema?)
)
```

### RouteConfig 配置

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| `title` | `string` | Feed 标题 |
| `description` | `string` | 详细描述（Markdown） |
| `fulltext` | `boolean` | 是否抓取全文 |
| `language` | `string[]` | 支持的语言 |
| `maintainer` | `object` | 维护者信息 |
| `withImage` | `string` | 图片策略 |

---

## Handler 上下文

Handler 函数接收的完整上下文对象。

### 属性 (Props)

```typescript
async ({
  // 元数据
  meta: {
    slug,        // Source slug
    title,       // Source 标题
    description, // Source 描述
    domain,      // 域名
    config,      // 配置值（已解析默认值）
  },

  // 请求参数
  params,        // 路由参数 (:param)
  query,         // 查询参数 (?key=value)
  lang,          // 请求语言
  headers,       // 请求头
}) => { ... }
```

### 注入函数

| 函数 | 说明 |
| ---- | ---- |
| `cache` | 缓存管理器 |
| `date` | 日期解析 |
| `ofetch` | HTTP 请求 |
| `load` | HTML 解析 |
| `formatHTML` | HTML 清理 |
| `toAbsoluteURL` | URL 转换 |
| `parse` | Feed 解析 |
| `logger` | 日志工具 |

---

## 路由 Schema 定义

使用 `t` 对象定义路由参数类型。

```typescript
import { t } from "@/utils";

app.get(
  "/user/:username/repo/:repo",
  handler,
  {
    params: t.Object({
      username: t.String({
        description: "用户名",
        examples: ["octocat"],
      }),
      repo: t.String({
        description: "仓库名",
      }),
    }),
  }
)
```

### 常用类型

| 类型 | 说明 |
| ---- | ---- |
| `t.String()` | 字符串 |
| `t.Number()` | 数字 |
| `t.Boolean()` | 布尔值 |
| `t.Optional()` | 可选参数 |
| `t.UnionEnum([])` | 枚举值 |

---

## 完整示例

```typescript
import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

export default new Source({
  slug: "example",
  title: "Example",
  description: "示例数据源",
  domain: "example.com",
  config: {
    API_KEY: {
      description: "API 密钥",
      required: false,
      default: "demo-key",
    },
  },
}).feed(
  {
    title: "最新内容",
    description: "获取最新内容列表",
    fulltext: true,
    language: ["zh-CN"],
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
          description: "内容分类",
        }),
      }),
    },
  ),
);
```
