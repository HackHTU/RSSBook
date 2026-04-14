# CLAUDE.md

## Project Overview

RSSBook 是一个 RSS Feed 生成器、工具集和博客平台。它支持多种运行时环境（Bun、Node.js、Deno、Cloudflare Workers、Netlify、Vercel），使用 ElysiaJS 框架构建。

## Common Development Commands

### 开发和构建

```bash
# 开发模式（Bun）
bun dev

# 开发模式（Node.js）
npx tsx src/node.ts

# 开发模式（Cloudflare Workers）
bun run dev:cf

# 生产构建（Bun）
bun run build

# 生产构建（Node.js）
bun run build:node
```

### 代码检查和测试

```bash
# 运行所有检查（TypeScript + Biome 格式化）
bun run check

# 仅 TypeScript 检查
bun run check:ts

# 仅 Biome 格式化检查
bun run check:biome

# 运行单元测试
bun test ./src/tests

# 运行所有路由测试
bun test ./src/routers

# 运行测试并生成覆盖率报告
bun test --coverage ./src/tests

# 运行 XSS 安全扫描和测试
bun run test
```

### 路由和源管理

```bash
# 创建新的源（Feed）
bun run source:new

# 测试单个源
bun run source:test

# 测试所有路由
bun run source:test:all
```

## Architecture Overview

### 核心架构层次

RSSBook 采用分层架构，从上到下为：

1. **入口层** (`src/index.ts`, `src/node.ts`, `src/cloudflare.ts` 等)
   - 针对不同运行时的入口文件
   - 调用 `RSSBookApp()` 初始化应用

2. **应用层** (`src/RSSBookApp.ts`)
   - 创建 Elysia 应用实例
   - 组织插件和路由
   - 配置顺序：错误处理 → 日志 → OpenAPI → 初始化 → 书籍 → 路由 → 静态资源

3. **插件层** (`src/plugins/`)
   - `initPlugin`: 初始化 RSSBook 实例，注入到 Elysia 上下文
   - `errorHandlerPlugin`: 全局错误处理
   - `loggerPlugin`: 请求日志
   - `openAPIPlugin`: 生成 OpenAPI 文档
   - `renderPlugin`: 注入渲染函数
   - `injectPlugin`: 注入工具函数（cache、date、ofetch 等）
   - `assetsPlugin`: 静态资源服务

4. **路由层** (`src/routers/`)
   - `feeds/`: 按分类组织的 Feed 路由（programming、news、blog 等）
   - `utils/`: 工具路由（fetch、filter、sort、union、intersection 等）

5. **数据处理层** (`src/utils/`)
   - Feed 解析：`parse()` - 解析 RSS/Atom/JSON Feed
   - Feed 操作：`filter()`、`sort()`、`union()`、`intersection()`
   - 缓存：`Cache` 类（支持 LRU、内存、KV 等）
   - 工具函数：日期格式化、HTML 处理、语言检测等

6. **主题层** (`src/books/`)
   - 渲染 Feed 为 HTML 页面
   - 支持自定义主题
   - 分页、搜索、分类过滤

### 关键类和概念

#### Source 类 (`src/utils/source.ts`)

定义单个数据源（如 GitHub、Twitter 等）。每个 Source 包含：

- **配置**：slug、title、description、domain、config 参数
- **Feed 定义**：通过 `.feed(config, handler)` 添加具体的 Feed 路由
- **路由生成**：自动生成 `/feeds/{category}/{slug}/{feedPath}` 格式的路由

```typescript
export default new Source({
  slug: "github",
  title: "Github",
  description: "Github is a code hosting platform...",
  domain: "github.com",
  config: {
    GITHUB_TOKEN: { description: "...", required: true }
  }
}).feed(
  { title: "User Events", description: "...", language: "en" },
  (app) => app.get("/events/:username", handler)
);
```

#### Category 类 (`src/utils/category.ts`)

将多个 Source 组织成一个分类。每个分类对应 `src/routers/feeds/{categoryName}/index.ts`。

```typescript
export default new Category("programming", "Resources about coding...").use({
  github,
  gitlab,
  // 其他源...
});
```

#### Data 类型 (`src/types/data.ts`)

所有 Feed 处理的标准数据格式：

```typescript
interface Data {
  title: string;
  link: string;
  description?: string;
  item?: DataItem[];
  // 其他元数据...
}

interface DataItem {
  title: string;
  link: string;
  description?: string;
  author?: Author[];
  category?: Category[];
  date?: string;
  id?: string;
  // ...
}
```

### 请求流程

1. 用户请求 `/feeds/{category}/{slug}/{feedPath}?type=rss`
2. 路由匹配到对应的 Source 和 Feed handler
3. Handler 通过 `ofetch` 获取数据，使用 `cache` 缓存
4. 返回 `Data` 对象
5. `renderPlugin` 将 Data 转换为 RSS/Atom/JSON Feed 格式
6. 如果 `type=html`，使用主题渲染为 HTML 页面

## Creating New Feeds

### 基本步骤

1. **创建源文件** `src/routers/feeds/{category}/{slug}/index.ts`

```typescript
import { Source } from "@/utils";

export default new Source({
  slug: "my-source",
  title: "My Source",
  description: "Description of the source",
  domain: "example.com",
  config: {
    // 可选的配置参数
  }
}).feed(
  {
    title: "Feed Title",
    description: "Feed description",
    language: "en",
    maintainer: { name: "Your Name" }
  },
  (app) => app.get("/path/:param", async (context) => {
    // 实现 Feed 逻辑
    return data satisfies Data;
  })
);
```

2. **在分类中注册** `src/routers/feeds/{category}/index.ts`

```typescript
import mySource from "./my-source";

export default new Category("category-name", "Description").use({
  mySource,
  // 其他源...
});
```

### Handler 上下文对象

Handler 接收的上下文包含：

- **props**：
  - `meta`: 源和 Feed 的元数据（domain、config、title 等）
  - `params`: 路由参数
  - `query`: 查询参数

- **函数**：
  - `cache`: 缓存对象，使用 `cache.tryGet(key, asyncFn)` 避免重复请求
  - `date`: 日期格式化函数
  - `ofetch`: 增强的 fetch 函数
  - `parse`: 解析 Feed 内容
  - `render`: 渲染 Data 为 Feed 格式

### 数据处理工具

- `filter(data, options)`: 按关键词、分类、日期范围过滤
- `sort(data, options)`: 按日期、标题排序
- `union(data1, data2, ...)`: 合并多个 Feed
- `intersection(data1, data2)`: 取交集
- `parse(xmlString)`: 解析 RSS/Atom Feed

## Code Style and Standards

### 类型安全

- 尽可能避免使用 `as`、`any`、`@ts-ignore`
- 使用 `satisfies` 关键字验证类型正确性
- 为 Feed handler 返回值使用 `satisfies Data`

### 代码格式

- 使用 `bun run check` 进行格式化检查（Biome）
- 使用 JSDOC 注释提高代码可读性
- 所有 Feed 路由必须是 GET 请求

### 命名规范

- Source slug：小写字母和短横线（如 `my-source`）
- 配置参数：大写字母和下划线（如 `GITHUB_TOKEN`）
- 分类名称：小写字母（如 `programming`）

## Multi-Runtime Support

项目支持多个运行时环境，每个有独立的入口文件：

- `src/index.ts`: Bun（推荐开发和部署）
- `src/node.ts`: Node.js
- `src/deno.ts`: Deno
- `src/cloudflare.ts`: Cloudflare Workers
- `src/netlify.ts`: Netlify
- `src/vercel.json`: Vercel 配置

所有入口文件都基于 `src/RSSBookApp.ts` 修改，可根据运行时特性配置缓存、存储等。

## Caching Strategy

项目使用 `Cache` 类管理缓存，支持多种后端：

- `Cache.LRU_Cache`: 内存 LRU 缓存（默认）
- Cloudflare Workers KV
- 其他 unstorage 支持的存储

在 handler 中使用：

```typescript
const data = await cache.tryGet(cacheKey, async () => {
  // 异步获取数据
  return result;
});
```

## Testing

- 单元测试位于 `src/tests/` 和 `src/routers/` 目录
- 使用 Bun 的内置测试框架
- 运行 `bun test` 执行所有测试
- 运行 `bun run source:test` 测试特定源

## Important Files

- `src/RSSBookApp.ts`: 应用主入口，定义插件顺序
- `src/routers/index.ts`: 路由组织
- `src/plugins/init.ts`: RSSBook 实例初始化
- `src/types/data.ts`: Feed 数据类型定义
- `src/utils/source.ts`: Source 类定义
- `src/utils/category.ts`: Category 类定义
- `src/books/index.ts`: 个人主页/书籍功能
