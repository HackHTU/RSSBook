# 📕RSSBook

<table align="center" width="70%">
    <tr>
        <td align="center" valign="middle" colspan="3">
            <img src="pkgs/rssbook/src/public/favicon.svg" alt="RSSBook Favicon" width="150" height="150" />
        </td>
    </tr>
    <tr>
        <td align="center" valign="middle" colspan="3">
            Your Feed Generator, Toolkits and Blogger.<br />你的 Feed 生成器，工具集和博客，都在这里。
        </td>
    </tr>
    <tr>
        <td align="center" valign="middle">
            README
        </td>
        <td align="center" valign="middle">
            <a href="/README.md" target="_blank">CN</a>
        </td>
        <td align="center" valign="middle">
            <a href="/README.EN.md" target="_blank">EN</a>
        </td>
    </tr>
    <tr>
        <td align="center" valign="middle">
            HELPER
        </td>
        <td align="center" valign="middle">
           <a href="https://rssbook.htu.me" target="_blank">OpenAPI</a>
        </td>
        <td align="center" valign="middle">
           <a href="#" target="_blank">Utils Feed Helper(WIP)</a>
        </td>
    </tr>
    <tr>
        <td align="center" valign="middle">
            ARTICLES
        </td>
        <td align="center" valign="middle">
           <a href="./CONTRIBUTING.md" target="_blank">Contributing</a>
        </td>
        <td align="center" valign="middle">
           <a href="docs/how-to-create-a-feed.md" target="_blank">How to Create a Feed(CN/EN)</a>
        </td>
    </tr>
</table>

- RSSBook 是一个 Feed 生成器，你可以当作 RSSHub 的轻量替代。
- RSSBook 是一个 Feed 工具集，快速合并/筛选/转换 Feed，甚至无需代码，快速从网页生成 Feed。
- RSSBook 是一个 Feed 博客，你可以通过订阅你在各个平台的 Feed（比如 GitHub、微博、Bilibili）来创建一个属于你的空间。

> [!CAUTION]
>
> 在版本号在 1.0 前，本项目还不稳定，我们还没有实现诸如在线生成器、Puppeteer 的集成、AI 的支持、环境变量、自动与上游同步和更好的库支持等，我们还有很长的路要走，欢迎你帮助我们改进项目。

## 项目结构

本项目采用 Monorepo 结构，使用 Bun Workspaces 管理：

```
RSSBook/
├── pkgs/
│   ├── rssbook/              ← 核心包（Feed 解析、路由、插件、主题等）
│   └── utils-feed-helper/    ← 工具包（Feed 辅助工具）
├── platform/
│   ├── cloudflare/           ← Cloudflare Workers 入口
│   ├── deno/                 ← Deno 入口
│   ├── netlify/              ← Netlify Edge Functions 入口
│   ├── node/                 ← Node.js 入口
│   └── vercel/               ← Vercel 入口
├── scripts/                  ← 脚本工具
└── docs/                     ← 文档
```

所有平台入口都基于 `pkgs/rssbook/src/RSSBookApp.ts` 进行修改，社区欢迎贡献更多运行时环境/服务商的支持。

## 开始

本指南将帮助你快速使用并配置 RSSBook 程序。关于编写新路由的教程，请看 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 安装环境

我们在多种环境下都可以运行 RSSBook 程序，但是我们使用 Bun 环境进行开发与测试，如果你在生产环境中使用 RSSBook，我们推荐你使用 Bun 进行部署。

如果你还没安装 JavaScript 运行时环境，请先安装 Bun，安装 Bun 的教程请看 [Bun Installation](https://bun.com/docs/installation)。

然后，你需要安装 Git 来克隆代码库，安装 Git 的教程请看 [Git Installation](https://git-scm.com/install/)。

最后，你需要安装一个支持 TypeScript 的代码编辑器，比如 [Visual Studio Code](https://code.visualstudio.com/)，IDEA 系列，或者是最新推出的 [Zed](https://zed.dev/)。

然后您需要在一个位置打开终端，运行以下命令来克隆代码库并安装依赖。

```bash
# 克隆代码库
git clone https://github.com/HackHTU/RSSBook.git
# 进入目录
cd RSSBook
# 安装依赖
bun install
```

用你的代码编辑器打开 `RSSBook` 文件夹，你就可以开始进行配置与开发了。

### 开发与部署

我们是在 Bun 环境下进行开发与测试的，Bun 是一个性能优异且资源占用低的运行时/包管理器/测试器/打包器等的一体化工具，如果你在生产环境中使用 RSSBook，我们推荐你使用 Bun 进行部署。

当然，我们对于其他运行时环境/服务商也进行支持，这些服务商有的有一些预定义环境（例如 KV 和数据库等），所以我们在 `platform` 目录下提供了多种环境的入口包，你可以根据你的需要进行选择。

> [!TIP]
>
> 我们有一个公开实例列表在 [HOSTS](./HOSTS)，在访问 OpenAPI 文档时**可能**会显示可用的实例列表，如果你乐意将你的实例分享给大家，欢迎提交 Pull Request 请求，并留下你的地址/版本信息/其他说明，我们会感谢你的贡献！

#### 开发

在根目录下，你可以使用 `bun run --filter` 来运行特定平台的开发命令：

```bash
# 核心包（Bun）开发
bun dev

# 其他平台开发
bun run --filter @rssbook/platform-cloudflare dev   # Cloudflare Workers
bun run --filter @rssbook/platform-node dev        # Node.js
bun run --filter @rssbook/platform-deno dev        # Deno
bun run --filter @rssbook/platform-vercel dev      # Vercel
bun run --filter @rssbook/platform-netlify dev     # Netlify
```

或者进入对应平台目录直接运行：

```bash
cd platform/cloudflare && bun run dev
```

#### 构建与部署

各平台的构建命令同样可以通过 `bun run --filter` 执行：

```bash
bun run --filter @rssbook/platform-cloudflare build   # Cloudflare Workers
bun run --filter @rssbook/platform-node build        # Node.js
bun run --filter @rssbook/platform-deno build        # Deno
bun run --filter @rssbook/platform-vercel build      # Vercel
bun run --filter @rssbook/platform-netlify build     # Netlify
```

部署到各平台：

```bash
bun run --filter @rssbook/platform-cloudflare deploy  # Cloudflare Workers
bun run --filter @rssbook/platform-vercel deploy      # Vercel
bun run --filter @rssbook/platform-netlify deploy     # Netlify
```

> [!NOTE]
>
> 更多关于 `bun run --filter` 的信息，请看 [Bun Workspaces](https://bun.sh/docs/install/workspaces)。

#### 平台特定说明

##### Bun

Bun 的入口文件在 `rssbook` 核心包中：`pkgs/rssbook/src/index.ts`。

Bun 是一个...不想说了，反正很快就是了。在生产时，你可以打包为二进制文件以获得最佳性能：

```bash
# All support target: https://bun.com/docs/bundler/executables#supported-targets
bun build --define NODE_ENV='"production"' --compile --minify-whitespace --minify-syntax --target bun-linux-x64 --outfile server pkgs/rssbook/src/index.ts
```

##### Node.js

Node.js 的入口文件在 `platform-node` 包中：`platform/node/index.ts`。

Node.js 是最主流的 JavaScript 运行时环境。在开发时，由于 Node.js 对原生 TypeScript 的支持还不完善，所以我们建议你使用 [tsx](https://github.com/privatenumber/tsx) 来启动服务器（已配置在 `package.json` 的 `dev` 脚本中）。

##### Deno

Deno 的入口文件在 `platform-deno` 包中：`platform/deno/index.ts`。

Deno 是一个继 Node.js 之后的另一个运行时环境。

[![Deploy on Deno](https://deno.com/button)](https://console.deno.com/new?clone=https://github.com/HackHTU/RSSBook&path=platform/deno)

##### CloudFlare Workers

我个人非常喜欢 [CloudFlare Workers](https://workers.cloudflare.com/)，它是一个基于 V8 引擎的 Serverless 计算平台，慷慨地提供了免费的使用额度，非常适合部署 RSSBook 程序。

CloudFlare Workers 的入口文件在 `platform-cloudflare` 包中：`platform/cloudflare/index.ts`。

在生产时，你可以直接点击下面的按钮来部署到 CloudFlare Workers，但是这种方式不支持**自定义配置**。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/HackHTU/RSSBook)

更好的方法是自己 Fork 本仓库，在 [Github CodeSpace](https://github.com/codespaces/new/) 或本地修改配置后，然后使用在 Cloudflare Workers 的设置中绑定你自己的 GitHub 仓库进行部署（或者你可以使用 GitHub Workflow）。

##### Vercel

Vercel 是一个非常流行的 Serverless 计算平台，也提供了慷慨的免费使用额度。

Vercel 的入口文件在 `platform-vercel` 包中：`platform/vercel/api/index.ts`。

Vercel 部署配置已写入 `platform/vercel/vercel.json`，会将 Framework Preset 设置为 Other。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHackHTU%2FRSSBook&root-directory=platform%2Fvercel)

##### Netlify

Netlify 是一个非常流行的 Serverless 计算平台，也提供了慷慨的免费使用额度。

Netlify 的入口文件在 `platform-netlify` 包中：`platform/netlify/index.ts`。

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/HackHTU/RSSBook&base=platform/netlify)

### 初始配置

在找到对应的入口文件后（各平台入口文件分布在不同的包中），你就可以开始配置 RSSBook 程序了。

在对应的入口文件中，你应该看到了一个 `RSSBookApp` 函数，这个函数用于创建 RSSBook 应用实例，你可以根据你的需要进行修改。

```ts
/* ... */
RSSBookApp({
    // 这里是配置项
})
/* ... */
```

> [!TIP]
>
> 对于某些入口文件，我们有一些默认的配置，比如在 `platform/cloudflare/index.ts` 中，我们使用 CloudFlare Workers KV 作为默认的缓存方案，你可以根据你的需要进行修改。

#### 配置说明

各平台入口文件中的 `RSSBookApp` 函数接受一个配置对象，本指南让你熟悉在各个功能模块中的常用配置项。

#### 使用个人主页

通常，你的博客，一些社交平台的动态（如 YouTube、Reddit 和 Mastodon）都提供了 Feed 链接。而没有提供 Feed 的平台，你可以通过本项目来生成 Feed 链接。

但你想过，我们是否可以集成各个平台的 Feed 来生成一个自己的个人主页吗？我们可以通过集成自己在各个社交平台的动态来实现这一点。

在配置文件中，你可以通过 `feeds` 来配置你想要集成的 Feed 链接。

#### 查看路由列表

在运行开发服务器或部署后，你可以通过访问 `/openapi` 路径来查看当前实例支持的路由列表，侧边栏会根据分类展示路由，你可以使用搜索（`Meta` + `K`）来搜索你想要的路由。

一般的路由的路径入口是 `GET` `/feeds/{{category}}/{{route}}`，你可以通过查看路由列表来获取对应的路径，然后点击 `Test Request` 按钮来测试对应的路由，每个路由还说明了自己的参数列表，维护者人员名单，配置项以及其他的基本信息。

由于不同 RSSBook 版本的实例可能会有不同的路由和功能，所以关于更多 OpenAPI 文档的信息，请看自己实例中 OpenAPI 文档开始的说明。

默认情况下，输出的 Feed 格式为 RSS 2.0，你也可以通过添加查询参数 `type` 来调整输出的 Feed 格式，特别的，当查询参数为 `?type=html` 时会使用主题来渲染此 Feed 为网站。

还有一个布尔值的查询参数 `styled`，用于控制是否启用 `XSL` 样式表来美化 Feed 的显示，在某些浏览器支持 `XML` 的 `XSL` 样式表情况下，显示出的 Feed 会有更好的可读性。

#### 使用工具路由

我们提供了一些诸如合并、排序、筛选、获取等便捷的 Feed 路由，这可能对一些不懂如何编写代码的人非常实用。

在 OpenAPI 文档中，你可以在分类 `utils` 查看并生成。

#### 创建路由

关于如何编写新路由，路由的规范以及测试的编写，请看 [如何编写一个 Feed](./docs/how-to-create-a-feed.md)。

### 高级教程

为了方便魔改，我们的尽量不引用复杂的技术栈，我们的底层（后端）使用 [ElysiaJS 框架](https://elysiajs.com/)。

在前端，我们默认使用 [Kita/html](https://kitajs.org/html/) 作为一个极快的 JSX 运行时来 SSR，对于默认主题，我们只通过 CDN 引入了没有构建流程（直接在 HTML 导入 JavaScript）的 [UnoCSS](https://unocss.dev/)（类似于 TailwindCSS）和 [DataStar](https://data-star.dev/)（类似于 HTMX + Alpine.js 的声明式框架）运行时，效果非常好。

#### 魔改默认主题

在 `pkgs/rssbook/src/books/theme` 下，你可以找到默认主题的代码，你只需要会一点 JSX 语法，知道 CSS/Tailwind 语法，你可以根据你的需要进行修改。

你也可以将默认主题集成 DataStar/Htmx/Alpinejs 等常用的小型框架，具体请看 [Kita/html 集成](https://kitajs.org/html/integrations)，自己尝试编写 JavaScript 代码自定义主题功能。

> [!TIP]
>
> 冷知识，默认主题是 Vibe Coding 的。
>
> 得益于 TSX 的类型安全，使得 AI 编写主题变得容易，同时，你可以使用你喜欢的 AI 通过 [Context7](https://context7.com/) MCP 使其更好地理解上述框架，我们同时欢迎你们开源自己的主题。

在浏览器预览 RSS/Atom XML 时，我们使用 [XSLT](https://developer.mozilla.org/zh-CN/docs/Web/XML/XSLT) 来做简单的样式处理，这是一个老旧的版本，而且可能在未来移除，所以仅用来做简单的预览功能，以上主题你可以在 `pkgs/rssbook/src/public/xsl` 下找到对应的文件，你可以根据你的需要进行修改。

#### 编写新的主题

当编写新主题时，你可以查看主题类型定义来编写主题，或是参考默认主题的实现。

在 `pkgs/rssbook/src/types/theme.ts` 中，你可以找到主题的类型定义，你可以根据你的需要编写新的主题。

> [!TIP]
>
> 你可以建立一个主题的工厂函数 `(props) => Theme` 来生成主题实例，这样可以让主题更具可配置性，然后你可以发布为一个 npm 包，方便其他人使用。

## 用例

RSSBook 不仅可以用作你的 Feed 阅读器，还可以用来做很多事情，以下是一些常见的用例。

### 创建自己的个人动态

### 使用自动化工具同步到 IM 平台

## 规范

为了可以持久发展，我们有一些代码规范和文档规范，以下是一些常见的规范。

### 路由规范

关于如何编写新路由，路由的规范以及测试的编写，请看 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 其他规范

类型安全：我们建议你**尽可能少**使用 TypeScript 的 `as` `any` `@ts-ignore` 等关键词，因为降低代码的可维护性。

代码美观：我们使用 Biome 作为格式化工具，我们建议你在提交代码前运行 `bun check` 命令来检查格式化代码。同时，我们建议你使用 JSDOC 语法来编写注释，这样可以提高代码的可读性和可维护性。

文字排版：关于文档的排版，我们建议你使用 Github Markdown 的标准语法进行编写，语气不用特别正式，但在中英文的混排中，全角或半角标点的使用需格外注意，中英文之间添加空格的要求需要格外注意。

## 社群

我们建议你在 Github 进行讨论与反馈，你可以通过提交 Issue 或 Pull Request 或者是在 Discussion 进行讨论的方式来参与到项目中来。

我们建议你只使用 EN/CN 两种语言进行交流，并且在发布时**请使用对应的语言分类标签**。

关于问题和新功能的反馈，请看 [ISSUE](https://github.com/HackHTU/RSSBook/issues).

关于功能的讨论，请在 [DISCUSSION](https://github.com/HackHTU/RSSBook/discussions) 中进行。

## 致谢

本项目离不开编写路由的各位贡献者的支持与帮助，感谢你们为 RSSBook 项目所做出的贡献！

[![Github Contributors](https://contrib.rocks/image?repo=HackHTU/RSSBook)](https://github.com/HackHTU/RSSBook/graphs/contributors)

本项目的灵感离不开 RSSHub 和 RSSWorker 项目。
本项目的开发离不开 Bun, Cheerio, dayjs, ElysiaJS, Kita/html, ofetch, sanitize-html, unstorage 优秀的开源项目。

本项目采用 MIT 许可证，详情请查看 [LICENSE](LICENSE) 文件。
