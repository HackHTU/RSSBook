# RSSBook

<table align="center" width="70%">
    <tr>
        <td align="center" valign="middle" colspan="3">
            <img src="pkgs/rssbook/src/public/favicon.svg" alt="RSSBook Favicon" width="150" height="150" />
        </td>
    </tr>
    <tr>
        <td align="center" valign="middle" colspan="3">
            Your Feed Generator, Toolkits and Blogger.
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

- RSSBook is a Feed generator, serving as a lightweight alternative to RSSHub.
- RSSBook is a Feed toolkit for quickly merging/filtering/transforming feeds, and even generating feeds from web pages without code.
- RSSBook is a Feed blog that lets you create your own space by subscribing to feeds from various platforms (e.g., GitHub, Weibo, Bilibili).

> [!CAUTION]
>
> Before version 1.0, this project is not yet stable. We haven't implemented features like an online generator, Puppeteer integration, AI support, automatic upstream sync, and better library support yet. We still have a long way to go, and your help in improving the project is welcome.

## Project Structure

This project uses a **Monorepo** structure managed with Bun Workspaces:

```
RSSBook/
├── pkgs/
│   ├── rssbook/              ← Core package (Feed parsing, routes, plugins, themes, etc.)
│   └── utils-feed-helper/    ← Helper package (Feed utility tools)
├── platform/
│   ├── cloudflare/           ← Cloudflare Workers entry
│   ├── deno/                 ← Deno entry
│   ├── netlify/              ← Netlify Edge Functions entry
│   ├── node/                 ← Node.js entry
│   └── vercel/               ← Vercel entry
├── scripts/                  ← Script tools
└── docs/                     ← Documentation
```

All platform entries are based on `pkgs/rssbook/src/RSSBookApp.ts`. Community contributions for more runtime/provider support are welcome.

## Getting Started

This guide will help you quickly set up and configure RSSBook. For a tutorial on writing new routes, see [CONTRIBUTING.md](CONTRIBUTING.md).

### Setting Up the Environment

RSSBook can run in multiple environments, but we use Bun for development and testing. If you're deploying RSSBook in production, we recommend using Bun.

If you haven't installed a JavaScript runtime yet, please install Bun first. See [Bun Installation](https://bun.com/docs/installation) for instructions.

Then, you need to install Git to clone the repository. See [Git Installation](https://git-scm.com/install/) for instructions.

Finally, install a code editor that supports TypeScript, such as [Visual Studio Code](https://code.visualstudio.com/), JetBrains IDEs, or the newer [Zed](https://zed.dev/).

Open a terminal in your desired location and run the following commands to clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/HackHTU/RSSBook.git
# Enter the directory
cd RSSBook
# Install dependencies
bun install
```

Open the `RSSBook` folder in your code editor, and you're ready to start configuring and developing.

### Development and Deployment

We develop and test using Bun. Bun is an all-in-one runtime/package manager/tester/bundler with excellent performance and low resource usage. If you're deploying RSSBook in production, we recommend using Bun.

Of course, we also support other runtimes/providers. Some of these providers have predefined environments (e.g., KV and databases), so we provide platform-specific entry packages in the `platform` directory for you to choose from.

> [!TIP]
>
> We have a public instance list at [HOSTS](./HOSTS). When accessing the OpenAPI documentation, available instances **may** be displayed. If you'd like to share your instance with everyone, feel free to submit a Pull Request with your URL/version info/other notes. We appreciate your contribution!

#### Development

From the root directory, you can use `bun run --filter` to run development commands for specific platforms:

```bash
# Core package (Bun) development
bun dev

# Other platform development
bun run --filter @rssbook/platform-cloudflare dev   # Cloudflare Workers
bun run --filter @rssbook/platform-node dev        # Node.js
bun run --filter @rssbook/platform-deno dev        # Deno
bun run --filter @rssbook/platform-vercel dev      # Vercel
bun run --filter @rssbook/platform-netlify dev     # Netlify
```

Or enter the corresponding platform directory and run directly:

```bash
cd platform/cloudflare && bun run dev
```

#### Build and Deploy

Build commands for each platform can also be executed via `bun run --filter`:

```bash
bun run --filter @rssbook/platform-cloudflare build   # Cloudflare Workers
bun run --filter @rssbook/platform-node build        # Node.js
bun run --filter @rssbook/platform-deno build        # Deno
bun run --filter @rssbook/platform-vercel build      # Vercel
bun run --filter @rssbook/platform-netlify build     # Netlify
```

Deploy to each platform:

```bash
bun run --filter @rssbook/platform-cloudflare deploy  # Cloudflare Workers
bun run --filter @rssbook/platform-vercel deploy      # Vercel
bun run --filter @rssbook/platform-netlify deploy     # Netlify
```

> [!NOTE]
>
> For more information on `bun run --filter`, see [Bun Workspaces](https://bun.sh/docs/install/workspaces).

#### Platform-Specific Notes

> [!TIP]
>
> Before diving into the platform-specific notes below, please read the [Initial Configuration](#initial-configuration) section first to learn how to configure RSSBook via the `RSSBookApp` function and [Environment Variables](#environment-variables).

##### Bun

The entry file for Bun is in the `rssbook` core package: `pkgs/rssbook/src/index.ts`.

Bun is a... I won't say more, it's just really fast. For production, you can build a binary for optimal performance:

```bash
# All supported targets: https://bun.com/docs/bundler/executables#supported-targets
bun build --define NODE_ENV='"production"' --compile --minify-whitespace --minify-syntax --target bun-linux-x64 --outfile server pkgs/rssbook/src/index.ts
```

##### Node.js

The entry file for Node.js is in the `platform-node` package: `platform/node/index.ts`.

Node.js is the most mainstream JavaScript runtime. For development, since Node.js's native TypeScript support is not yet complete, we recommend using [tsx](https://github.com/privatenumber/tsx) to start the server (configured in the package's `dev` script).

##### Deno

The entry file for Deno is in the `platform-deno` package: `platform/deno/index.ts`.

Deno is another runtime following Node.js.

[![Deploy on Deno](https://deno.com/button)](https://console.deno.com/new?clone=https://github.com/HackHTU/RSSBook&path=platform/deno)

##### CloudFlare Workers

I personally love [CloudFlare Workers](https://workers.cloudflare.com/). It's a serverless computing platform based on the V8 engine that generously provides a free tier, making it perfect for deploying RSSBook.

The entry file for CloudFlare Workers is in the `platform-cloudflare` package: `platform/cloudflare/index.ts`.

For production, you can directly click the button below to deploy to CloudFlare Workers. After deployment, you can customize RSSBook configuration through environment variables or a `wrangler` config file in the Cloudflare Workers settings (see the [Initial Configuration - Environment Variables](#environment-variables) section).

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/HackHTU/RSSBook)

A better approach is to fork this repository, modify the configuration in [Github CodeSpace](https://github.com/codespaces/new/) or locally, then configure your own GitHub repository in Cloudflare Workers settings for deployment (or you can use GitHub Workflow).

##### Vercel

Vercel is a popular serverless computing platform that also provides a generous free tier.

The entry file for Vercel is in the `platform-vercel` package: `platform/vercel/api/index.ts`.

Vercel deployment settings are defined in `platform/vercel/vercel.json`, which sets the Framework Preset to Other.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHackHTU%2FRSSBook&root-directory=platform%2Fvercel)

##### Netlify

Netlify is a popular serverless computing platform that also provides a generous free tier.

The entry file for Netlify is in the `platform-netlify` package: `platform/netlify/index.ts`.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/HackHTU/RSSBook&base=platform/netlify)

### Initial Configuration

After finding the corresponding entry file (each platform's entry file is in its own package), you can start configuring RSSBook.

In the entry file, you should see a `RSSBookApp` function used to create the RSSBook application instance. You can modify it according to your needs.

```ts
/* ... */
RSSBookApp({
    // Configuration options here
})
/* ... */
```

> [!TIP]
>
> For some entry files, we have default configurations. For example, in `platform/cloudflare/index.ts`, we use CloudFlare Workers KV as the default caching solution, which you can modify as needed.

#### Configuration Reference

The `RSSBookApp` function in each platform's entry file accepts a configuration object. This guide helps you understand common configuration options across feature modules.

#### Environment Variables

You can also configure RSSBook via environment variables. All available variables defined in `pkgs/rssbook/src/app.ts` are listed below.

| Name | Type | Description | Default | Example |
| --- | --- | --- | --- | --- |
| `RSSBOOK_BOOK_CACHE_MAX_AGE_MS` | Number (ms) | Cache TTL in milliseconds for aggregated book feed data. | `600000` (10 minutes) | `RSSBOOK_BOOK_CACHE_MAX_AGE_MS="600000"` |
| `RSSBOOK_BOOK_CONFIG` | `key=value` list | Feed source config values, as comma-separated `key=value` pairs. | `{}` | `RSSBOOK_BOOK_CONFIG="GITHUB_TOKEN=token,DISCORD_TOKEN=token"` |
| `RSSBOOK_BOOK_FEEDS` | URL list | Feed URLs aggregated by the book page, as a comma-separated string. | `https://rssbook.htu.me/feeds/programming/github/trending/daily` | `RSSBOOK_BOOK_FEEDS="https://rssbook.htu.me/feeds/programming/github/trending/daily"` |
| `RSSBOOK_BOOK_THEME` | Theme name | Built-in book theme. Allowed values: `gallery` `magazine` `masonry` `minimal` `reader` `redbook`. | `redbook` | `RSSBOOK_BOOK_THEME="redbook"` |
| `RSSBOOK_META_DESCRIPTION` | String | Page description rendered in HTML metadata. | not rendered | `RSSBOOK_META_DESCRIPTION="A simple RSS feed aggregator and reader."` |
| `RSSBOOK_META_KEYWORDS` | String list | Page keywords rendered in HTML metadata, as a comma-separated string. | not rendered | `RSSBOOK_META_KEYWORDS="rss,reader,feeds"` |
| `RSSBOOK_META_LANG` | String | HTML language value. | not rendered | `RSSBOOK_META_LANG="en"` |
| `RSSBOOK_META_TITLE` | String | Page title rendered in HTML metadata. | not rendered | `RSSBOOK_META_TITLE="RSSBook"` |
| `RSSBOOK_OPENAPI_ENABLE_FETCH_ONLINE_SERVER` | Boolean | Enable fetching public online server entries for the OpenAPI server list. | `true` | `RSSBOOK_OPENAPI_ENABLE_FETCH_ONLINE_SERVER="true"` |
| `RSSBOOK_STATIC` | Boolean | Enable static asset serving. | `true` | `RSSBOOK_STATIC="false"` |

> [!NOTE]
>
> Array-shaped values (e.g. `RSSBOOK_BOOK_FEEDS`, `RSSBOOK_META_KEYWORDS`) are provided as comma-separated strings. Source config values use comma-separated `key=value` pairs. Booleans accept `true` `false` `1` `0` `yes` `no` `on` `off` (case-insensitive); any other value is ignored.
>
> Default sources: `RSSBOOK_BOOK_FEEDS` is hard-coded in `pkgs/rssbook/src/app.ts` via `??`; the others come from downstream modules — `RSSBOOK_BOOK_CACHE_MAX_AGE_MS` / `RSSBOOK_BOOK_CONFIG` from `pkgs/rssbook/src/plugins/init.ts`; `RSSBOOK_BOOK_THEME` from `DEFAULT_THEME` in `pkgs/rssbook/src/books/themes.ts`; `RSSBOOK_OPENAPI_ENABLE_FETCH_ONLINE_SERVER` from `pkgs/rssbook/src/plugins/openAPI.ts`; `RSSBOOK_STATIC` from `pkgs/rssbook/src/plugins/static.ts`.

#### Using the Personal Homepage

Typically, your blog and social platform activities (like YouTube, Reddit, and Mastodon) provide Feed links. For platforms without Feed support, you can generate Feed links through this project.

But have you ever thought about integrating feeds from various platforms to create your own personal homepage? You can achieve this by integrating your activities from different social platforms.

In the configuration file, you can configure the feeds you want to integrate using `feeds`.

#### Viewing the Route List

After starting the development server or deploying, you can access the `/openapi` path to view the list of routes supported by the current instance. The sidebar displays routes by category, and you can use search (`Meta` + `K`) to find the route you want.

The general route path is `GET` `/feeds/{{category}}/{{route}}`. You can check the route list to find the corresponding path, then click the `Test Request` button to test the route. Each route also shows its parameter list, maintainer information, configuration options, and other basic information.

Since different RSSBook versions may have different routes and features, please refer to the documentation at the beginning of your instance's OpenAPI for more information.

By default, the output Feed format is RSS 2.0. You can adjust the output format by adding the `type` query parameter. When the query parameter is `?type=html`, the theme will render the Feed as a website.

There's also a boolean query parameter `styled` to control whether to enable the `XSL` stylesheet for styling the Feed display. In browsers that support XML XSL stylesheets, the displayed Feed will have better readability.

#### Using Utility Routes

We provide convenient Feed routes such as merge, sort, filter, and fetch, which can be very useful for people who don't know how to write code.

In the OpenAPI documentation, you can find and generate them under the `utils` category.

#### Creating Routes

For how to write new routes, route specifications, and writing tests, see [How to Create a Feed](./docs/how-to-create-a-feed.md).

### Advanced Tutorial

To facilitate customization, we尽量 avoid complex tech stacks. Our backend uses the [ElysiaJS framework](https://elysiajs.com/).

On the frontend, we use [Kita/html](https://kitajs.org/html/) as a blazing-fast JSX runtime for SSR. For the default theme, we only use [UnoCSS](https://unocss.dev/) (similar to TailwindCSS) and [DataStar](https://data-star.dev/) (a declarative framework similar to HTMX + Alpine.js) runtimes imported via CDN without a build process (JavaScript imported directly in HTML), which works very well.

#### Customizing the Default Theme

In `pkgs/rssbook/src/books/theme`, you can find the default theme code. You only need some JSX syntax knowledge and CSS/Tailwind syntax to modify it according to your needs.

You can also integrate DataStar/Htmx/Alpinejs and other popular micro-frameworks into the default theme. See [Kita/html Integrations](https://kitajs.org/html/integrations) and try writing JavaScript code to customize theme functionality.

> [!TIP]
>
> Fun fact: the default theme was created using Vibe Coding.
>
> Thanks to TSX's type safety, AI can easily write themes. You can also use your preferred AI with [Context7](https://context7.com/) MCP for better understanding of the above frameworks. We also welcome you to open-source your themes.

When previewing RSS/Atom XML in the browser, we use [XSLT](https://developer.mozilla.org/en-US/docs/Web/XML/XSLT) for simple styling. This is an older version and may be removed in the future, so it's only for basic preview functionality. You can find the corresponding files in `pkgs/rssbook/src/public/xsl` and modify them as needed.

#### Writing New Themes

When writing new themes, you can refer to the theme type definitions or the default theme implementation.

In `pkgs/rssbook/src/types/theme.ts`, you can find the theme type definitions and write new themes according to your needs.

> [!TIP]
>
> You can create a theme factory function `(props) => Theme` to generate theme instances, making themes more configurable. Then you can publish it as an npm package for others to use.

## Use Cases

RSSBook can be used not only as your Feed reader but also for many other purposes. Here are some common use cases.

### Creating Your Personal Activity Feed

RSSBook's Book feature aggregates any number of feeds and renders them as a personal homepage through a theme template, making it perfect as your "digital living room."

Typical steps:

1. Configure the feeds you want to aggregate via the `RSSBOOK_BOOK_FEEDS` environment variable (or by calling `RSSBookApp({ book: { feeds: [...] } })` in your entry file). For example:
   ```bash
   RSSBOOK_BOOK_FEEDS="https://your-instance/feeds/programming/github/events/vercel,https://your-instance/feeds/programming/github/trending/daily,https://your-instance/feeds/multimedia/sspai/matrix"
   ```
2. (Optional) Pick a built-in theme with `RSSBOOK_BOOK_THEME`:
   ```bash
   RSSBOOK_BOOK_THEME="redbook"
   ```
   Allowed values: `gallery` `magazine` `masonry` `minimal` `reader` `redbook`.
3. (Optional) Customize page metadata via `RSSBOOK_META_TITLE` / `RSSBOOK_META_DESCRIPTION` / `RSSBOOK_META_LANG` / `RSSBOOK_META_KEYWORDS`:
   ```bash
   RSSBOOK_META_TITLE="My Personal Feed"
   RSSBOOK_META_DESCRIPTION="My personal activity aggregator"
   RSSBOOK_META_LANG="en"
   RSSBOOK_META_KEYWORDS="rss,reader,personal"
   ```
4. After deployment, visit your instance's homepage to see the aggregated page. You can also force HTML rendering with `?type=html` and enable the XSL stylesheet with `styled=true`.

If some feed sources require authentication (e.g., a GitHub Token), inject them into `RSSBOOK_BOOK_CONFIG` as `key=value` pairs:

```bash
RSSBOOK_BOOK_CONFIG="GITHUB_TOKEN=ghp_xxx"
```

Each feed source reads the config keys it declares (see `GITHUB_TOKEN` usage in `pkgs/rssbook/src/routers/feeds/programming/github/index.ts`).

### Syncing to IM Platforms Using Automation Tools

RSSBook itself only "produces feeds," but since the output is standard RSS 2.0, you can plug it into any automation tool that supports RSS subscriptions — the most common one is [IFTTT](https://ifttt.com/).

As an example, let's sync **GitHub Trending to a Discord channel**:

1. **Get your feed URL.** RSSBook ships with a GitHub Trending Daily Feed by default:
   ```
   https://your-instance/feeds/programming/github/trending/daily
   ```
   Append `?type=rss` to explicitly request the RSS 2.0 format.
2. **Create an Applet on IFTTT**: go to [Create](https://ifttt.com/create) → **If This** → choose **RSS Feed** → select the **New feed item** trigger → paste the URL above into *Feed URL*.
3. **Configure the IM action** (**Then That**). Pick one of the following:
   - **Discord**: choose **Discord** → **Post message to channel** → pick the target server and channel → in *Message*, use IFTTT placeholders, e.g.:
     ```
     📰 {{EntryTitle}}
     {{EntryURL}}
     ```
     You can also prepend `{{FeedTitle}}` to tag the source.
   - **Telegram**: choose **Telegram** → **Send message** → connect your bot → in *Message text*, use `{{EntryTitle}}` / `{{EntryURL}}` / `{{EntryContent}}`.
   - **Slack**: choose **Slack** → **Post to channel** → in *Message*:
     ```
     *{{EntryTitle}}* — {{EntryURL}}
     ```
   - **Webhooks / WeCom / Feishu bot**: choose **Webhooks** → **Make a web request**, paste the IM bot's webhook URL into *URL*, handcraft the JSON body in *Body* (you can use `{{EntryTitle}}` and friends), set *Method* to `POST` and *Content Type* to `application/json`.
4. **Finish and enable.** IFTTT will poll the RSS source on its update cadence (typically every 15–30 minutes) and push new entries to your IM platform.

> [!TIP]
>
> - You can create one Applet per RSSBook route, so "GitHub → Discord", "V2EX → Telegram", "Sspai → Slack" stay independent.
> - If your IM platform has no official IFTTT service (e.g., Feishu, DingTalk), prefer the **Webhooks** action — IFTTT will substitute `{{EntryTitle}}` / `{{EntryURL}}` / `{{EntryContent}}` / `{{EntryPublished}}` / `{{FeedTitle}}` into your custom request body.
> - To avoid duplicate pushes, enable *Filter code* (JavaScript) in the Applet settings and gate the trigger on `EntryPublished` being within the last N hours.


## Standards

For sustainable development, we have some code and documentation standards. Here are some common standards.

### Route Standards

For how to write new routes, route specifications, and writing tests, see [CONTRIBUTING.md](CONTRIBUTING.md).

### Other Standards

Type Safety: We recommend using TypeScript's `as`, `any`, `@ts-ignore` keywords **as little as possible**, as they reduce code maintainability.

Code Formatting: We use Biome as the formatter. We recommend running `bun check` before committing code to check formatting. We also recommend using JSDOC syntax for comments to improve code readability and maintainability.

Text Formatting: For documentation formatting, we recommend using GitHub Markdown standard syntax. The tone doesn't need to be overly formal, but pay special attention to punctuation usage (full-width vs. half-width) and spacing between Chinese and English text.

## Community

We recommend discussing and providing feedback on Github. You can participate in the project by submitting Issues, Pull Requests, or discussing in Discussions.

We recommend communicating only in EN/CN languages, and please **use the corresponding language category tags** when posting.

For bug reports and feature requests, see [ISSUE](https://github.com/HackHTU/RSSBook/issues).

For feature discussions, please use [DISCUSSION](https://github.com/HackHTU/RSSBook/discussions).

## Acknowledgments

This project would not be possible without the support and help of all contributors who have written routes. Thank you for your contributions to the RSSBook project!

[![Github Contributors](https://contrib.rocks/image?repo=HackHTU/RSSBook)](https://github.com/HackHTU/RSSBook/graphs/contributors)

This project's inspiration comes from RSSHub and RSSWorker.
This project's development relies on Bun, Cheerio, dayjs, ElysiaJS, Kita/html, ofetch, sanitize-html, unstorage and other excellent open-source projects.

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
