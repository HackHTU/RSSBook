## 添加新的 Feed

> This document is also available in [English](how-to-create-a-feed.EN.md).

本指南将带你真实创建一个可用的 Feed，并提交到 RSSBook 项目中。

### 快速开始

通过 RSSBook 创建 Feed 的前提是该网站没有现成的 Feed。

查询网站是否有 Feed 的方法有很多，比如在网站的页眉或页脚查找 Feed 的标志，查看网站的源代码中的 `<head>` 部分是否有指向 Feed 的链接，或者使用搜索引擎搜索“网站名称 + RSS/Atom/JSON Feed”也是一个好方法。

![阮一峰的网络日志](assets/find-existing-feed.png)

如果该网站已经有 Feed，请直接使用现有的 Feed，RSSBook 永远应该作为你没有找到 Feed 时的后备方案。

然后你需要确定网站是否已经在 RSSBook 的路由列表中，你可以访问 OpenAPI 在线文档查询你的目标网站是否已经有相关的路由。

![RSSBook OpenAPI 文档](assets/find-existing-routes.png)

在 RSSBook 中，每个网站是一个 `Source`，每个 `Source` 可以包含多个 `Feed` 路由，如果你的网站已经有对应的 `Source`，只是没有你想要的功能（`Feed` 路由），你只需要为该 `Source` 添加一个新的 `Feed` 路由即可，如果没有，你需要创建一个新的 `Source`。

接下来，你需要先克隆仓库并安装 RSSBook 的开发环境，这一部分在 [README.md](./README.md) 中有详细说明。

#### 创建一个 Source

正如之前提到的，每个网站是一个 `Source`，每个 `Source` 可以包含多个 `Feed` 路由。如果你的目标网站还没有对应的 `Source`，你需要先创建一个新的 `Source`。

进入项目目录，你可以运行辅助命令来创建一个新的 `Source`：

```bash
bun run source:new
```

这将启动一个交互式向导，指导你完成创建 `Source` 的过程。

你需要选择一个合适的分类，然后为你 `Source` 的 `slug` 命名，`Source` 的命名建议使用网站的域名或简短的标识符，只有小写字母、数字和中划线（`-`），不能包含空格或其他特殊字符。

> [!TIP]
> 
> 一般来说，可以使用网站的一级域名作为 `slug`，比如 `google.com.hk` 可以命名为 `google`。

> [!CAUTION]
>
> 分类和 `slug` 一旦确定，就不能**轻易更改**（除非网站迁移或改名等特殊情况），因为这会影响到所有路由路径。

创建完成后，会在 `src/routers/feeds/{分类名}/{slug名}` 目录下生成 `index.ts` 文件，你需要**删除注释**，并根据你的需求修改 `Source` 的元信息，比如标题、稍微短的描述、站点链接等，这些信息能在 `Feed` 中获取，并显示在 RSSBook 的文档中，所以请确保它们准确。

最后，你需要在分类文件夹下的 `index.ts` 文件中注册你的 `Source`，这样 RSSBook 才能识别并加载它。

我们制作的示例 Feed 是 Elysiajs Blog(https://elysiajs.com/blog.html)，ElysiaJS 是一个在 Bun 环境下运行的轻量级 Web 框架，你可以在 `src/routers/feeds/updates/elysiajs/index.ts` 查看示例代码。

![ElysiaJS Blog](./assets/elysia-blog.png)

我们已经寻找了这个页面并没有现有的 Feed，所以我们决定为它创建一个新的 Feed。我们可以把它放在 `updates` 分类下，`slug` 命名为 `elysiajs`，所以我们创建一个新的文件夹 `elysiajs`，里面有一个 `index.ts` 文件，默认导出一个 `Source` 。

```ts
// updates/elysiajs/index.ts
import { Source } from "@/utils";

export default new Source({
	description: `ElysiaJS is a lightweight web framework that runs on Bun.`,
	domain: "elysiajs.com",
	slug: "elysiajs",
	title: "elysiajs",
})
```

别忘了在分类中注册你的 `Source`：

```ts
// updates/index.ts
import { Category } from "@/utils";

import elysiajs from "./elysiajs";

export default new Category(
	"updates",
	"**Announcements and updates** about products, services, or projects.",
)
	.use({
		/// ...other sources

		elysiajs
	});

```

#### 编写 Feed 逻辑

在创建好 `Source` 之后，你需要为该 `Source` 添加一个或多个 `Feed`。

添加 `Feed` 的操作永远是[链式调用](https://en.wikipedia.org/wiki/Method_chaining)的。在大部分的时候，你只需要编辑 `index.ts` 文件即可。

> [!TIP]
>
> 你可以把可复用的逻辑和功能转移到单独的文件夹中，比如 `{slug}/type/activity.ts`，然后在 `index.ts` 中导入使用。

```ts
import { Source } from "@/utils";

export default new Source({
	/* ...source metadata */
})
	.feed() // 添加一个 Feed
	.feed({/* ...feed metadata */}, (app) => app/* ... */); // 添加另一个 Feed
```

我们有了一个新方法 `.feed(config, handlerFn): this` 用于添加一个新的 `Feed` 路由。

`config` 与之前相似，你需要补充 `Feed` 的元信息，比如标题、描述等。

你可以 `config.description` **尽可能详细**描述该 Feed 的功能和用途，还能描述等等定义的路由参数，你可以使用 Github Markdown 语法来编写描述内容，关于更多 Github Markdown 语法，请参考 [GitHub 官方文档](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)。

不过这次，你需要为作为路由创建者的你标注署名，你需要添加你的 **Github 用户名**，还可以添加你的一段介绍，邮箱或自己的博客链接，以便我们感谢你。

`handlerFn` 是你需要编写 Feed 的逻辑，这部分是最重要的。handlerFn 是一个函数，接受一个 `app` 参数。

你可以参考下面我们定义的 `elysiajs update` Feed：

```ts
export default new Source({/* ...config */})
	.feed(
		{
			description: "Update on the latest news, and insights about ElysiaJS.",
			fulltext: true,
			language: "en-US",
			maintainer: {
				name: "RSSBook",
			},
			title: "Latest News",
			withImage: "If-Present",
		},
		app => app,
	);
```

我们需要为 `app` 添加 **一个 GET 路由**（因为全部 Feed 都是 GET 方法），形如 `app => app.get(path, handler, schema)` 的形式。

`path` 是该 Feed 的路径，通过形如 `/path` 的形式定义一个静态路由，通过形如 `/:param` 的形式定义一个路由参数，使其成为动态路由。

> [!TIP]
>
> 路由的选取，比如说路由名，静态路由和动态路由是你需要考虑的一点。
>
> 所有的 Feed 路径都应该都有 `/feeds/{category}/{source-slug}` 的前缀，后面跟着你定义的 `path`。
>
> 如果你的目标网站是一个**单用户的网站，而且没有其他页面，没有分类/标签等功能**，你可以直接使用 `/` 作为主页 Feed 的路径。
>
> 如果你的目标网站，**有多个用户、分类或标签**，你可以创建一个以上的 Feed，第一是 `/` 为路径的首页 Feed，第二你可以使用动态路由参数来在 Feed 中获取分类或标签，比如 `/user/:username` 或 `/category/:category`。
>
> 如果你的目标网站**有多个单独的页面**，你还可以使用静态路由为每个页面创建一个单独的静态路由，如 `/news`、`/sports` 等等。
>
> 在定义路由后，你可以在 OpenAPI 文档中查看路由信息。

因为我们要为 `https://elysiajs.com/blog` 创建一个 Feed，我们可以将 `path` 定义为 `/blog`。

```ts
.feed(
	{/* ...config */},
	app => app.get(
		"/blog",
		async () => {
			// ...logic

			return data;
		},
	),
);
```

`handler` 是路由的处理函数，在这里编写你的抓取逻辑，它通常是异步（`async` 标注的）的箭头函数，返回一个符合 `Data` 类型的数据对象。

它接受一个 Context 类型（这个类型你并不能获取到）参数，在大多数情况下，你需要使用像 `{}` 的[**解构赋值**](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Destructuring)来获取你需要的属性。

在这个对象中，你可以通过解构一些属性和方法来为编写 Feed 逻辑提供便利，比如访问刚才定义的元数据，使用工具函数，帮助你更方便地编写 Feed 逻辑，这些工具函数在 `src/utils` 定义。

> [!CAUTION]
>
> 不要在 `@/utils` 中导入具体的工具函数，直接从 `Context` 对象中解构获取它们。

在解构赋值中，你可以使用 VSCode 或其他编辑器的智能补全功能（一般是将光标移到参数后按下 `Ctrl` + `Space`）来查看有哪些属性和方法可以使用，也可以将鼠标（或光标）悬停在某个属性或方法上，以查看其类型信息和文档。

![使用 VSCode 进行智能补全](assets/using-type-intellisense.png)

---
一些常用的属性和方法包括：

属性
- `params`
	访问路由参数的对象。

	如果你在路由路径中定义了参数，比如 `/category/:category`，你可以通过 `params: { category }` 来解构访问该参数的值，除此之外，你还要在 `app.get(path, handler, schema)` 的 `schema` 中定义参数的模式，以便 RSSBook 能够验证请求参数的正确性。

- `lang`
	访问当前请求的语言。

	如果你在为一个多语言网站编写 Feed，HTTP 头中的 `Accept-Language` 会被解析为一个语言代码的偏好，你可以通过这个属性来获取当前请求的语言代码，以便为不同语言的用户提供不同的内容。

- `meta`
	访问 `Source` 的元信息。

	你应该使用 `meta: { domain }` 中的 `domain` 构造请求 URL，以确保请求的正确性。

	如果你设定了配置，你可以通过 `meta: { config }` 来访问这些配置选项。

- `logger`
	日志记录工具。

	你可以使用它来记录调试信息、错误信息等，帮助你调试和排查问题。

	```ts
	logger.info("This is an info message");
	logger.warn("This is a warning message");
	logger.error("This is an error message");
	```

函数
- `ofetch(url, options?)`
	封装后的网络请求工具。

	它基于 `ofetch`，并且预设了一些常用的选项，比如一些请求头，重试和超时等。

	最简单的使用方法通常是下面这样：

	```ts
	app.get(
		"/category/:category",
		async ({ params: { category }, meta: { domain }, ofetch }) => {	
			
			const html = ofetch(`https://${domain}/category/${category}`, {
				responseType: "text",
			});

		},
		{ /* ...schema */ }
	);
	```

> [!IMPORTANT]
>
> 不要使用 `fetch`，使用 `ofetch` 代替原生的 `fetch`，无论如何你都应该使用这个方法来进行网络请求。
> 
> `ofetch` 在**非 HTTP 200 响应时会抛出错误**，你需要使用 `try catch` 自行处理这个错误。

- `date(date, timezone?): Date`
	日期解析工具。

	它可以解析一些简单的**相对时间和绝对时间字符串**，或是一个 Timestamp 时间戳，并返回 `Date` 对象。

	`timezone` 参数为可选的 UTC Offset 字符串，比如中国标准时间是 `+8`。

```ts
const date1 = date("2 hours ago"); // 解析相对时间
const date2 = date("2023-10-01 12:00:00", "+8"); // 解析绝对时间
const date3 = date(1696156800000); // 解析时间戳
```

- `formatHTML(html, baseURL?, options?): string`
	HTML 格式化工具。

	它会将 HTML 字符串清除样式和脚本以及不必要的属性。

	有些网站的图片/视频等资源使用**相对路径**，你可以通过 `baseURL` 参数来指定一个基础 URL，以便将相对路径**转换为绝对路径**。

```ts
const rawHTML = $("article").html();
const formattedHTML = formatHTML(rawHTML, "https://example.com");
```

> [!IMPORTANT]
>
> 所有的 HTML 内容都应该使用这个方法进行格式化，以确保内容的安全性和一致性。

- `load(content, options?)`
	HTML 解析工具。

	它基于 `cheerio`，可以让你使用类似 jQuery 的语法来解析和操作 HTML 内容。

	首先，你需要传入一个 HTML 字符串作为 `content` 参数，然后你可以使用返回的 `CheerioAPI` 对象来查询和操作 HTML。

	通常，你会将 HTML 字符串传给 `load` 方法并赋值为 `$`，然后使用 `$(cssSelector)` 来选择元素。
	
```ts
const html = ofetch(`https://${domain}/category/${category}`);
const $ = load(html);

const title = $("title").text(); // 访问文本内容
const href = $("a").attr("href"); // 访问属性
const items = $("article").html(); // 访问 HTML 内容

$("div.article")
	.toArray() // 转换为数组
	.map((elem) => {
		return {};
	})
	.filter((item) => {
		return !!item.title;
	});

```

> [!CAUTION]
>
> CSS 选择器不是 `XPath`，在使用 CSS 选择器时，请确保选择器的正确性，某些网站可能会使用动态生成的类名或 ID，这可能会导致选择器失效。
>
> 你可以使用浏览器的开发者工具来辅助你编写 CSS 选择器（右键点击元素选择“检查”，然后选择“复制”一栏的“选择器”，但是浏览器给出的是选择器路径，你需要剔除或补充一些选择器，以便精准定位到一些元素），有关 CSS 选择器的更多信息，请参考 [MDN 文档](https://developer.mozilla.org/docs/Web/CSS/Guides/Selectors)。

- `sleep(ms): Promise<void>`
	异步延时等待工具。

	在某些情况下，你可能需要在请求之间添加延时，比如避免触发目标网站的反扒机制，你可以使用这个方法来实现延时等待。

```ts
await sleep(2000); // 等待 2 秒
```

- `toAbsoluteURL(url, base): string`
	转换为绝对 URL 工具。

	它可以将一个相对（或绝对）URL 转换为绝对 URL string。

```ts
const absoluteURL = toAbsoluteURL("/path/to/resource", "https://example.com");
```

- `uuid(...input?): string`
	唯一标识符工具。

	它帮助你生成可复现的唯一 UUID。如果你传入了一个和多个 `input` 参数，它会基于 `JSON.stringify(input)` 生成一个可复现的 UUID，如果不传入参数，它会生成一个随机的 UUID。

```ts
const id1 = uuid(); // 随机 UUID
const id2 = uuid("Tung", "Tung", "Tung", "Sahur"); // 基于输入生成的 UUID
```

> [!TIP]
> 
> 由于本文档可能会随着时间推移而失去时效性，更好的方法是阅读 `src/utils/*.ts` 文件中的类型标注和函数的 JSDoc 注释，以了解每个工具函数的最新用法。
---

好的，啰嗦一大堆，但是你不需要完全搞懂所有的东西，当你使用 CLI 创建一个新的 `Source` 时，会生成一个基础的模版，你只需要根据你的目标网站修改这个模版即可。

> [!TIP]
>
> 你可以参考 `src/router/feeds/_example/` 目录下的示例代码，这些代码展示了如何使用各种工具函数来编写 Feed 逻辑，其中包括通过 API 和 HTML 页面抓取数据的示例。

刚刚的箭头函数返回的数据需要**符合 `@/types` 的 `Data` 类型**（实际文件在 `src/types/data.ts`），否则会提示类型错误。

![返回值不符合 Data 类型会出现类型错误](assets/return-type-need-to-confirm-data.png)

你可以使用 `return {/* ... */} satisfies Data` (而不是 `as`) 指定类型，并使用智能补全来确保类型正确。

![指定类型并使用 VSCode 进行智能补全](assets/specify-the-type-to-intellisense.png)

我们回到刚才的 `elysiajs` Feed 示例，我们需要抓取 `https://elysiajs.com/blog` 页面上的文章列表，并返回符合 `Data` 类型的数据对象。

首先，我们现将构造 URL 字符串，我们可以使用缓存抓取页面内容，然后使用 `load` 方法解析 HTML 内容。

```ts
app => app.get(
	"/blog",
	async ({
		// props
		meta: { domain }, 

		// functions
		cache,
		load,
		ofetch,
	}) => {
		const rootURL = `https://${domain}`;
		const url = `${rootURL}/blog`;

		const lists = await cache.tryGet(url, async (url) => {
			const html = await ofetch(url, { responseType: "text" });
			const $ = load(html);
		});
	},
);
```

接着，你需要使用打开开发者者工具，分析页面结构，找到标题、链接、发布时间和内容等信息的 CSS 选择器，你可以使用 `Meta + Shift + C`（Mac）或 `Ctrl + Shift + C`（Windows/Linux）打开开发者工具的元素选择器，然后点击页面上的元素，以查看其 HTML 结构。

![找到标题的 CSS 选择器](./assets/find-lists-css-selector.png)

这个页面只展示了标题和简介，我们要根据判断，避免自动生成的 `class` 和 `id`，选出相应的选择器。我们看到标题在 `header h1`，简介在 `header p`。

```ts
app => app.get(
	"/blog",
	async ({
		// props
		meta: { domain }, 

		// function
		cache, // cache 是一个缓存，你可以用它来存储和复用数据，避免重复抓取
		date, // date 会解析日期字符串并返回一个 Date 对象
		toAbsoluteURL, // toAbsoluteURL 会将相对 URL 转换为绝对 URL
		formatHTML, // formatHTML 是一个 HTML 格式化工具
		load, // load 会解析 HTML 并返回一个类似 jQuery 的解析器
		logger, // logger 是一个日志工具，你可以用它来记录日志
		ofetch, // ofetch 是一个增强版的 fetch 函数
	}) => {
		const rootURL = `https://${domain}`;
		const url = `${rootURL}/blog`;

		const lists = await cache.tryGet(url, async (url) => {
			const html = await ofetch(url, { responseType: "text" });
			const $ = load(html);

			const title = $("header h1").text().trim();
			const description = $("header p").text().trim();
		});
	},
);
```

然后，我们需要获取文章列表，我们要找出适配所有文章的选择器。

![找到文章的 CSS 选择器](./assets/find-articles-selector.png)

在这里，我们看到第一篇文章是 `main > a`，其他文章是 `main > section > a`，所以我们可以使用 `main > a, main > section > a` 作为选择器来获取所有文章。然后把它们转换为数组，使用 `map` 方法来遍历每个文章元素。

```ts
const html = await ofetch(url, { responseType: "text" });
const $ = load(html);

const title = $("header h1").text().trim();
const description = $("header p").text().trim();

const items = $("main > a, main > section > a")
	.toArray()
	.map((elem) => {
		const $elem = $(elem);

	});
```

然后我们提取每篇文章的标题、链接和发布时间，筛选掉没有链接的项，我们可以在 `Context` 对象中解构 `toAbsoluteURL` 和 `date` 方法来帮助我们处理链接和日期。

```ts
const rootURL = `https://${domain}`;
const url = `${rootURL}/blog`;

const data = await cache.tryGet(url, async (url) => {
	const html = await ofetch(url, { responseType: "text" });
	const $ = load(html);

	const title = $("header h1").text().trim();
	const description = $("header p").text().trim();

	const items = $("main > a, main > section > a")
		.toArray()
		.map((elem) => {
			const $elem = $(elem);

			let image = $elem.find("img").attr("src");
			if (image) {
				image = toAbsoluteURL(image, rootURL);
			}

			const title = $elem.find("h2").text().trim();
			const description = $elem.find("p").text().trim();

			let link = $elem.attr("href");
			if (link) {
				link = toAbsoluteURL(link, rootURL);
			} else {
				return null; // 过滤掉没有链接的项
			}

			const dateString = $elem.find("time").attr("datetime") || "";
			const pubDate = date(dateString);

			return {
				date: pubDate,
				description,
				image,
				link,
				title,
			} satisfies DataItem;
		})
		.filter((item) => item !== null); // 过滤掉没有链接的项

	return {
		description,
		item: items,
		link: url,
		title,
	} satisfies Data;
```

我们成功地抓取了文章列表，并返回了符合 `Data` 类型的数据对象。下一步是抓取全文，由于文章列表有很多，我们应该并发抓取并缓存每篇文章的内容，如果请求错误，我们还能回退到只包含简介的文章。

所以我们现构建一个包含所有文章内容的 `Promise` 数组，然后使用 `Promise.all` 来并发执行这些请求。

```ts
const rootURL = `https://${domain}`;
const url = `${rootURL}/blog`;

const data = await cache.tryGet(url, async (url) => { /* ... */ });

const promises = data.item.map(async (item) => {
	const link = item.link;

	return cache.tryGet(link, async (link) => {
		try {
			const html = await ofetch(link, { responseType: "text" });
			const $ = load(html);

			let content = $("article").html();
			if (content) {
				item.content = formatHTML(content, rootURL);
			}

			return item; // 返回有全文的项
		} catch {
			logger.error(`Failed to fetch article content: ${link}`);
			return item; // 返回原始项
		}
	})
})

const item = await Promise.all(promises);
const results = {
	...data,
	item,
};

return results;
```

然后，你可以打开本地开发环境，在浏览器打开 OpenAPI 文档（一般是 `localhost:8787/openapi`，会在启动时的控制台中显示）中测试你的 Feed 是否正确工作。如果你的 Feed 有路由参数，你可以在路径中添加参数进行测试。

如果一切正常，你应该能看到符合预期的 Feed 数据。

然后，如果你刚才定义了动态的路由参数，你需要为你刚才定义的 Feed 添加一个**模式（Schema）**，以便 RSSBook 能够验证请求参数和响应数据的正确性。

我们刚才说到的 `app.get(path, handler, schema)` 方法的第三个参数 `schema` 就是用来定义模式的，它是一个对象。

如果我们刚才定义了一个动态路由参数 `/:category`，我们需要为这个参数添加一个模式定义，将 `params` 作为对象的 key，然后使用 `t` 工具来定义参数的类型。

```ts
import { Source, t } from "@/utils";

app.get(
	"/category/:category",
	handler,
	{
		// 定义参数的模式
		params: t.Object({
			category: t.UnionEnum(["news", "sports", "entertainment"], {
				description: "The category of articles to fetch.",
			}),
		}),
	}
)
```

> [!TIP]
>
> `t` 工具基于 [TypeBox](https://github.com/sinclairzx81/typebox) 构建，提供了一种简单的方式来定义和验证数据结构。
>
> 你会发现，对象的所有 value 都是 `t.*` 方法调用的结果，这些方法用于定义不同类型的数据，比如字符串、数字、布尔值、数组、枚举等。
>
> 如果可以，你可以在定义路由参数时，使用第二个参数来添加 50 字以内的简短描述信息，以便在 OpenAPI 文档中显示。如果你的参数不太让人理解或很长，**请在 `.feed(config, handlerFn)` 的 `config.description` 中添加更详细的描述信息**。

如果一切都好，你的 Feed 应该可以在 OpenAPI 文档中正确显示，并且参数验证也能正常工作。

#### 测试

在你完成 Feed 逻辑的编写后，你需要测试你的代码是否正确工作。

你可以运行辅助命令来为你的 Feed 添加或进行测试。

```bash
bun run source:test
```

他会查询最后一次提交之后的修改，然后检测这些修改中的 `Source` 中是否有对应的测试，如果没有，则提示你创建一个基本测试。

### 提交你的更改

在这一部分前，你需要有一个 GitHub 账号。你需要在 GitHub 上分叉（Fork）RSSBook 仓库，然后将你本地的更改推送到**你自己的仓库**中。

在这之后，请你仔细阅读 **路由规则** 部分，确保你的 Feed 符合要求，包括命名规范、元信息正确性以及编写了测试等。

接着，你需要使用代码格式化工具对你的代码进行检查和格式化。

```bash
bun run
```

之后，你就可以提交你的更改到你自己的仓库中了。

```bash
git add .
git commit -m "feat: add new feed for {网站名称}"
git push origin main
```

之后，你需要前往 RSSBook 仓库，创建一个 Pull Request，将你的更改提交到 RSSBook 的主仓库中。

> [!CAUTION]
>
> 每次 Pull Request 都只能有一个 `Source` 的更改，如果你有多个 `Source` 的更改，请为每个 `Source` 创建一个单独的 Pull Request。

### 高级

以上教程已经能完整地指导你创建一个小的 Feed 了，但 RSSBook 还支持更多高级功能，在下面的部分，我们将介绍一些高级功能。

当你接触这一部分，你可能已经对 RSSBook 有了一定的了解，如果你要编写更复杂的 Feed，这些功能会对你有所帮助。

在编写更复杂的逻辑时，你可能发现在 `index.ts` 文件可能有点过长了，这个时候你需要的是分离它们，通常来说，你可以建立一些约定成俗的子文件夹，例如 `utils`、`plugins` 和 `types` 等等，然后将相关的逻辑放到这些文件夹中。

**我们推荐你只在 `index.ts` 文件中编写路由逻辑，其他的辅助函数和类型都放到子文件夹中**。不过，如果你的 Feed 如果实在过于复杂，你确实可以将 `handlerFn` 分离到单独的文件中。

我们创建了一个便捷类型 `Source.AppType<Source>`，你可以把 `source.feed(config, handlerFn)` 的 `handlerFn` 提取到外部，不过别忘了将 `source` 作为默认导出。

```ts
const handlerFn = (app: Source.AppType<typeof source>) => app.get("/", async () => {
	// ...logic

	return data;
});

const source = new Source(/* ... config */)
	.feed(/* ...config */, handlerFn);

export default source;
```

#### 添加多语言支持

如果你的目标网站支持多语言，你可以为你的 Feed 添加多语言支持，当用户请求不同语言时（我们使用请求头来判断），返回不同语言的内容。

`ctx.lang` 属性可以帮助你获取当前请求的语言代码，你可以根据这个语言代码来返回不同语言的内容。

大部分多语言网站只是在 URL 中添加一个语言参数或路径前缀，你可以根据这个参数或前缀通过构造不同 URL 来抓取不同语言的内容。

```ts
const rootURL = `https://${domain}`;
const langPath = lang.includes("zh") ? "zh" : "en";
const url = `${rootURL}/${langPath}/home`;
```

#### 添加配置

如果你的 Feed 需要提供一些配置选项，比如 API 密钥、用户名密码等，你可以添加配置支持。

这些配置在 `Source` 时定义，在 `RSSBookApp` 初始化时传入，然后你可以通过 `ctx.meta.config` 来访问这些配置选项。

你的配置名应该由你的 Slug 名大写加下划线组成，比如 `google` 的配置名可以是 `GOOGLE_CONFIG`。

```ts
config: {
	GOOGLE_EXAMPLE_APIKey: {
		default: "Bearer 123-456-7890",
		description: "RSSBook APIKey",
		required: true,
	},
},
```

#### 添加中间件

RSSBook 的路由是基于 [ElysiaJS](https://elysiajs.com/) 框架构建的，你可以为你的 Feed 添加中间件，以便在请求处理之前或之后执行一些操作。

```ts
app => app
	.use(middleware)
	.get(path, handler, schema?);
```

### 示例

我们在 `src/router/feeds/_example/` 目录下提供了一些真实的模版，你可以直接复制并修改以创建新的 `Source` 和 `Feed`。

同时，查询前人编写的 Feed 逻辑也是一个很好的学习方法，在这里感谢所有为 RSSBook 贡献过代码的开发者。
