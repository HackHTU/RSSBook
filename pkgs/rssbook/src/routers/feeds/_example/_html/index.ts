import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

/**
 * `_html` is an example source that fetches data from HTML.
 * `_html` 是一个使用 HTML 获取数据的示例源。
 *
 * We use the `Source` class to define a new source, and we need to default export this instance.
 * In the `Source` constructor, we pass the source's basic information, which will be displayed
 * in the OpenAPI documentation.
 *
 * 我们使用 `Source` 类来定义一个新的源，我们需要将这个实例默认导出。
 * 在 `Source` 构造函数中，我们传递了源的基本信息，这些参数会在 OpenAPI 文档中展示。
 */
export default new Source({
	// Source parameters need to be passed during RSSBook initialization.
	// We recommend using uppercase letters and underscores to name these parameters for distinction.
	// 源的参数需要在 RSSBook 初始化时传入，我们推荐使用大写字母和下划线来命名这些参数，以示区别。
	config: {
		DEEPIN_EXAMPLE_APIKey: {
			default: "Bearer 123-456-7890",
			description: "RSSBook APIKey",
			required: true,
		},
		DEEPIN_EXAMPLE_USERID: {
			default: "1234567890",
			description: "User ID",
		},
	},

	description: // Source description, one sentence is enough / 源的描述信息，一句话即可
	`Deepin is a Linux distribution that features the Deepin Desktop Environment (DDE), a desktop environment built on Qt and available for a variety of distributions.`,

	domain: "deepin.org", // Source root domain / 源的根域名

	slug: "deepin", // [IMPORTANT]: Source unique identifier, must be lowercase letters and hyphens, must match your folder name / [IMPORTANT]: 源的唯一标识符，必须是小写字母和短横线组成，需要与你的文件夹名称一致

	title: "Deepin", // Source title / 源的标题
})
	// Next, we use the `.feed(config, handlerFn)` method to define the Feed's specific fetching logic and metadata.
	// 接下来，我们使用 `.feed(config, handlerFn)` 方法来定义 Feed 的具体抓取逻辑和元数据。
	.feed(
		{
			description: // Feed description in Markdown, detailing the Feed's purpose and all route parameters, can include tables etc.
				// 使用 Markdown 的 Feed 描述信息，详细介绍 Feed 的作用和所有路由参数，可以包含表格等复杂内容。
				`The Deepin Community News.`,

			fulltext: true, // Whether to fetch full text content / 是否抓取全文内容

			language: ["zh-CN", "en-US"], // Languages supported by this Feed / 该 Feed 支持的语言

			maintainer: // Maintainer information, displayed in Feed metadata
				// 维护者信息，会显示在 Feed 的元数据中
				{
					name: "RSSBook",
				},

			title: "Community News",

			withImage: "If-Present",
		},
		/**
		 * handlerFn is the specific implementation for each `feed`, an `app => app` callback function.
		 * It accepts an ElysiaJS-based application instance and returns the same instance.
		 * You don't need to know too many details.
		 *
		 * handlerFn 是每个 `feed` 的具体实现，是一个 `app => app` 回调函数。
		 * 它接受一个基于 `ElysiaJS` 的应用实例，返回一个相同的实例，你不需要知道太多细节。
		 *
		 * In this callback, we typically use `app => app.get(path, handler, schema?)` to define routes.
		 * 在这个回调函数中，我们通常使用 `app => app.get(path, handler, schema?)` 方法来定义路由。
		 */
		(app) =>
			app
				/**
				 * Here, you can use the `app` instance to define routes and handling logic.
				 *
				 * All routes can only be **GET requests**, so use `app.get(path, handler, schema?)` to define routes.
				 * The route path prefix is `/feeds/{{category}}/{{slug}}/`, e.g., `/feeds/_example/api/`.
				 * You can visit `/openapi` in development mode to view and test these routes.
				 *
				 * 在这里，你可以使用 `app` 实例来定义路由和处理逻辑。
				 * 所有的路由都只能是 **GET 请求**，所以你要用到 `app.get(path, handler, schema?)` 方法来定义路由。
				 * 你构建的路由路径前缀是 `/feeds/{{category}}/{{slug}}/`，例如 `/feeds/_example/api/`。
				 * 你可以在开发环境下访问 `/openapi` 来查看并测试这些路由。
				 *
				 * Below is an example homepage route.
				 * 下面是一个主页的示例路由。
				 */
				.get(
					/**
					 * This is the relative path of the route.
					 * You can use `:param` to define one or more route parameters.
					 *
					 * 这是路由的相对路径。
					 * 你可以使用 `:param` 定义一个和多个路由参数。
					 */
					"/",

					/**
					 * This is the route handler function where you write your fetching logic.
					 * It accepts a Context object parameter. In most cases, you need to use destructuring
					 * like `props: { }` to get the properties you need.
					 * The returned data must conform to the `Data` type. You can use `satisfies Data` to ensure type correctness.
					 *
					 * 这是路由的处理函数，在这里编写你的抓取逻辑。
					 * 它接受一个 Context 对象参数，在大多数情况下，你需要使用像 `props: {  }` 的解构赋值来获取你需要的属性。
					 * 返回的数据需要符合 `Data` 类型，你可以使用 `satisfies Data` 来确保类型正确。
					 */
					async ({
						// props
						meta: { domain }, // meta contains all metadata for the source and Feed, such as domain, config, title, etc.
						// meta 包含了源和 Feed 的所有元数据，例如 domain、config、title 等等。
						lang, // lang is the language of the current request, parsed from the Accept-Language header
						// lang 是当前请求的语言，它解析自请求头的 Accept-Language 属性

						// function
						cache, // cache is a cache, you can use it to store and reuse data, avoiding repeated fetching
						// cache 是一个缓存，你可以用它来存储和复用数据，避免重复抓取
						date, // date parses date strings and returns a Date object
						// date 会解析日期字符串并返回一个 Date 对象
						toAbsoluteURL, // toAbsoluteURL converts relative URLs to absolute URLs
						// toAbsoluteURL 会将相对 URL 转换为绝对 URL
						formatHTML, // formatHTML is an HTML formatting tool
						// formatHTML 是一个 HTML 格式化工具
						load, // load parses HTML and returns a jQuery-like parser
						// load 会解析 HTML 并返回一个类似 jQuery 的解析器
						logger, // logger is a logging tool
						// logger 是一个日志工具
						ofetch, // ofetch is an enhanced fetch function
						// ofetch 是一个增强版的 fetch 函数
					}) => {
						const rootURL = `https://${domain}`;

						// Deepin Community News has pages in two languages
						// Deepin Community News 有两个语言版本的页面
						const langPath = lang?.includes("zh") ? "zh" : "en";
						const link = `${rootURL}/${langPath}/community-news/`; // https://www.deepin.org/en/community-news/

						// 1. First, use cache `cache.tryGet(key, fetcher, maxAge?)` to fetch the article list page.
						// 1. 首先，我们使用缓存 `cache.tryGet(key, fetcher, maxAge?)` 抓取文章列表的页面。
						const list: DataItem[] = await cache.tryGet(link, async (url) => {
							const html = await ofetch(url, { responseType: "text" }); // Use ofetch to fetch page HTML, with automatic retries on failure
							// 使用 ofetch 抓取页面的 HTML，请求失败会自动重试，重试最大次数后会抛出错误。
							const $ = load(html); // Use load to parse HTML, commonly named with $ prefix
							// 使用 load 解析 HTML，通常我们习惯将它命名为 $ 开头的变量。

							// Then, use jQuery-like syntax to extract the data we need.
							// 然后，我们使用类似 jQuery 的语法来提取我们需要的数据。
							const articles: DataItem[] = $("main#main article.post") // Select all article nodes via CSS selector
								// 通过 CSS 选择器选中所有的文章节点
								.toArray() // Convert to array, then use .map() to iterate each node
								// 转换为数组，然后使用 .map() 方法来遍历每个节点
								.map((item) => {
									const $item = $(item); // Convert each node to a jQuery object for easier manipulation
									// 将每个节点转换为 jQuery 对象，方便后续操作。

									const authorName = $item.find(".entry-meta .author").text().trim();
									const authorLink = $item.find(".entry-meta .author a").attr("href");
									const author = {
										link: authorLink ? toAbsoluteURL(authorLink, rootURL) : undefined,
										name: authorName,
									};

									const dateString = $item.find("div.entry-meta .updated").text().trim();
									const pubDate = date(dateString, +8); // Specify UTC+8 timezone and parse string
									// 指定为 UTC+8 时区并解析字符串

									const description = $item.find("div.entry-content p").text().trim();

									let image = $item.find("figure img").attr("src");
									if (image) {
										image = toAbsoluteURL(image, url);
									}

									let link = $item.find("header .entry-title a").attr("href");
									if (link) {
										link = toAbsoluteURL(link, url);
									} else {
										return null;
									}

									const title = $item.find("header h1").text().trim();

									return {
										author: [author],
										date: pubDate,
										description,
										image,
										link,
										title,
									} satisfies DataItem;
								})
								.filter((item) => !!item); // Skip null items without links / 跳过没有链接的 null 项

							return articles;
						});

						// 2. After parsing the list, fetch each article's content.
						// 2. 解析列表后，获取每篇文章的内容。
						const promises: Promise<DataItem>[] = // Don't use await yet, build a Promise array to execute concurrently later
							// 现在不要使用 await，构建一个 Promise 数组，稍后再并发执行它们。
							list.map(async (item: DataItem) => {
								const link = item.link;

								// We also use cache to fetch each article's content, then modify the previous item data
								// 我们也使用缓存来抓取每篇文章的内容，然后修改之前的 item 数据
								try {
									return await cache.tryGet(link, async (link) => {
										const contentHtml = await ofetch(link, { responseType: "text" });
										const $content = load(contentHtml);

										const contentRaw = $content("main#main article.post div.entry-content").html();
										const content = contentRaw ? formatHTML(contentRaw, rootURL) : undefined;
										item.content = content;

										return item;
									});
								} catch (error) {
									// If fetching article content fails, log the error and return the item without full text
									// 如果抓取文章内容失败，我们记录错误日志，还能返回之前没有全文的 item 数据
									logger.error(`Failed to fetch article at ${link}: ${error}`);
									return item;
								}
							});

						// 3. Use `await Promise.all()` to execute all fetch tasks concurrently
						// 3. 使用 `await Promise.all()` 来并发执行所有的抓取任务
						const item = await Promise.all(promises);

						// 4. Finally, construct and return the Data object.
						// 4. 最后，构造 Data 对象并返回。
						const data: Data = {
							description: "The Deepin Community News.",
							item,
							language: "en-US",
							link,
							title: "Deepin Community News",
							updated: new Date(),
						};

						return data;
					},
				),
	)
	// In the next example, we use dynamic parameters to define route parameters and route schema
	// 下一个例子，我们使用动态参数来定义路由参数和路由 schema
	.feed(
		{
			description: `The Deepin Community News by author`,
			fulltext: true,
			language: ["en"],
			maintainer: {
				name: "RSSBook",
			},
			title: "Community News by Author",
		},
		(app) =>
			// We use `:param` to define a route parameter author
			// 我们用 `:param` 定义一个路由参数 author
			app.get(
				"/author/:author",
				async ({
					// props
					params: { author }, // Get route parameter from `params` in Context
					// Context 中 `params` 获取路由参数
					meta: { domain },
					lang,

					// function
					cache,
					date,
					formatHTML,
					toAbsoluteURL,
					load,
					logger,
					ofetch,
				}) => {
					const rootURL = `https://${domain}`;
					const langPath = lang?.includes("zh") ? "zh" : "en";
					const link = `${rootURL}/${langPath}/community-news/${author}`;

					// In more complex routes, you can create utility functions in `utils/*.ts`
					// or use middleware in `plugins/*.ts`
					// 在实际编写更复杂更多的路由中，你可以创建 `utils/*.ts` 中抽取和复用这些逻辑函数，或者创建 `plugins/*.ts` 使用中间件来处理
					const list: DataItem[] = await cache.tryGet(link, async (url) => {
						const html = await ofetch(url, { responseType: "text" });
						const $ = load(html);

						const articles: DataItem[] = $("main#main article.post")
							.toArray()
							.map((item) => {
								const $item = $(item);

								const authorName = $item.find(".entry-meta .author").text().trim();
								const authorLink = $item.find(".entry-meta .author a").attr("href");
								const author = {
									link: authorLink ? toAbsoluteURL(authorLink, rootURL) : undefined,
									name: authorName,
								};

								const dateString = $item.find("div.entry-meta .updated").text().trim();
								const pubDate = date(dateString, +8);

								const description = $item.find("div.entry-content p").text().trim();

								let image = $item.find("figure img").attr("src");
								if (image) {
									image = toAbsoluteURL(image, url);
								}

								let link = $item.find("header .entry-title a").attr("href");
								if (link) {
									link = toAbsoluteURL(link, url);
								} else {
									return null;
								}

								const title = $item.find("header h1").text().trim();

								return {
									author: [author],
									date: pubDate,
									description,
									image,
									link,
									title,
								} satisfies DataItem;
							})
							.filter((item) => !!item);

						return articles;
					});

					const promises: Promise<DataItem>[] = list.map(async (item: DataItem) => {
						const link = item.link;

						try {
							return await cache.tryGet(link, async (link) => {
								const contentHtml = await ofetch(link, { responseType: "text" });
								const $content = load(contentHtml);

								const contentRaw = $content("main#main article.post div.entry-content").html();
								const content = contentRaw ? formatHTML(contentRaw, rootURL) : undefined;
								item.content = content;

								return item;
							});
						} catch (error) {
							logger.error(`Failed to fetch article at ${link}: ${error}`);
							return item;
						}
					});

					const item = await Promise.all(promises);

					const data: Data = {
						description: "The Deepin Community News.",
						item,
						language: "en-US",
						link,
						title: "Deepin Community News",
						updated: new Date(),
					};

					return data;
				},
				{
					// In the third parameter of `.get(path, handler, schema?)`, we use `t` to define route schema
					// In most cases, you only need to define the `params` part
					// 在 `.get(path, handler, schema?)` 的第三个参数中，我们使用 `t` 定义路由 schema，大多数情况，你只需要定义 `params` 部分
					params: t.Object({
						// The key is the route parameter name, the value is the parameter type definition
						// You can specify format, add description and examples, but keep descriptions concise
						// You should explain parameters in the longer Feed description
						// 对象的 key 是路由参数的名称，value 是参数的类型定义
						// 你可以指定格式，添加描述信息和示例，但是描述要简洁，你应该在更长的 Feed 描述中说明参数
						author: t.String({
							// format: "uri"
							description: "Author name to filter articles.",
							examples: ["xiaofei", "cxbii"],
						}),

						// Or use enum types to limit parameter values
						// 或是使用枚举类型来限定参数值
						// category: t.Optional(
						// 	t.UnionEnum(["news", "updates", "releases"], {
						// 		description: "Category of the feed.",
						// 		examples: ["news", "updates"],
						// 	}),
						// ),
					}),
					///
					/// But do not define body, query or other parts
					/// Defining these parts violates design principles and may cause errors
					/// 但是不要定义 body query 等其他部分，定义这些部分违反了设计原则，还可能出现错误
					///
				},
			),
	);
