import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

/**
 * `_html` 是一个使用 HTML 获取数据的示例源。
 *
 * 我们使用 `Source` 类来定义一个新的源，我们需要将这个实例默认导出。
 * 在 `Source` 构造函数中，我们传递了源的基本信息，这些参数会在 OpenAPI 文档中展示。
 */
export default new Source({
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

	description: // 源的描述信息，一句话即可
	`Deepin is a Linux distribution that features the Deepin Desktop Environment (DDE), a desktop environment built on Qt and available for a variety of distributions.`,

	domain: "deepin.org", // 源的根域名

	slug: "deepin", // [IMPORTANT]: 源的唯一标识符，必须是小写字母和短横线组成，需要与你的文件夹名称一致，这里仅作为演示

	title: "Deepin", // 源的标题。
})
	// 接下来，我们使用 `.feed(config, handlerFn)` 方法来定义 Feed 的具体抓取逻辑和元数据。
	.feed(
		{
			description: // 使用 Markdown 的 Feed 描述信息，详细介绍 Feed 的作用和所有路由参数，可以包含表格等复杂内容。
			`The Deepin Community News.`,

			fulltext: true, // 是否抓取全文内容。

			language: ["zh-CN", "en-US"], // 该 Feed 支持的语言

			maintainer: // 维护者信息，会显示在 Feed 的元数据中。
				{
					name: "RSSBook",
				},

			title: "Community News",

			withImage: "If-Present",
		},
		/**
		 * handlerFn 是每个 `feed` 的具体实现，是一个 `app => app` 回调函数。
		 * 它接受一个基于 `ElysiaJS` 的应用实例，返回一个相同的实例，你不需要知道太多细节。
		 *
		 * 在这个回调函数中，我们通常使用 `app => app.get(path, handler, schema?)` 方法来定义路由。
		 */
		(app) =>
			app
				/**
				 * 在这里，你可以使用 `app` 实例来定义路由和处理逻辑。
				 *
				 * 所有的路由都只能是** GET 请求**，所以你要用到 `app.get(path, handler, schema?)` 方法来定义路由。
				 * 你构建的路由路径前缀是 `/feeds/{{category}}/{{slug}}/`，例如 `/feeds/_example/api/`。
				 * 你可以在在开发环境下访问 `/openapi` 来查看并测试这些路由。
				 *
				 * 下面是一个主页的示例路由。
				 */
				.get(
					/**
					 * 这是路由的相对路径。
					 *
					 * 你可以使用 `:param` 定义一个和多个路由参数。
					 */
					"/",

					/**
					 * 这是路由的处理函数，在这里编写你的抓取逻辑。
					 *
					 * 它接受一个 Context 对象参数，在大多数情况下，你需要使用像 `props: {  }` 的解构赋值来获取你需要的属性。
					 * 返回的数据需要符合 `Data` 类型，你可以使用 `satisfies Data` 来确保类型正确。
					 */
					async ({
						// props
						meta: { domain }, // meta 包含了源和 Feed 的所有元数据，例如 domain、config、title 等等。
						lang, // lang 是当前请求的语言，他解析自请求头的 Accept-Language 属性

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

						// Deepin Community News 有 两个语言版本的页面
						const langPath = lang?.includes("zh") ? "zh" : "en";
						const link = `${rootURL}/${langPath}/community-news/`; // https://www.deepin.org/en/community-news/

						// 1. 首先，我们使用缓存 `cache.tryGet(key, fetcher, maxAge?)` 抓取文章列表的页面。
						const list: DataItem[] = await cache.tryGet(link, async (url) => {
							const html = await ofetch(url, { responseType: "text" }); // 使用 ofetch 抓取页面的 HTML，请求失败会自动重试，重试最大次数后会抛出错误。
							const $ = load(html); // 使用 load 解析 HTML，通常我们习惯将它命名为 $ 开头的变量。

							// 然后，我们使用类似 jQuery 的语法来提取我们需要的数据。
							const articles: DataItem[] = $("main#main article.post") // 通过 CSS 选择器选中所有的文章节点
								.toArray() // 转换为数组 然后使用 .map() 方法来遍历每个节点
								.map((item) => {
									const $item = $(item); // 将每个节点转换为 jQuery 对象，方便后续操作。

									const authorName = $item.find(".entry-meta .author").text().trim();
									const authorLink = $item.find(".entry-meta .author a").attr("href");
									const author = {
										link: authorLink ? toAbsoluteURL(authorLink, rootURL) : undefined,
										name: authorName,
									};

									const dateString = $item.find("div.entry-meta .updated").text().trim();
									const pubDate = date(dateString, +8); // 指定为 UTC+8 时区并解析字符串

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
								.filter((item) => !!item); // 跳过掉没有链接的 null 项

							return articles;
						});

						// 2. 解析列表后，获取每篇文章的内容。
						const promises: Promise<DataItem>[] = // 现在不要使用 await，构建一个 Promise 数组，稍后再并发执行它们。
							list.map(async (item: DataItem) => {
								const link = item.link;

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
									// 如果抓取文章内容失败，我们记录错误日志，还能返回之前没有全文的 item 数据
									logger.error(`Failed to fetch article at ${link}: ${error}`);
									return item;
								}
							});

						// 3. 使用 `await Promise.all()` 来并发执行所有的抓取任务
						const item = await Promise.all(promises);

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
			// 我们用 `:param` 定义一个路由参数 author
			app.get(
				"/author/:author",
				async ({
					// props
					params: { author }, // Context 中 `params` 获取路由参数
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
					// 在 `.get(path, handler, schema?)` 的第三个参数中，我们使用 `t` 定义路由 schema，大多数情况，你只需要定义 `params` 部分
					params: t.Object({
						// 对象的 key 是路由参数的名称，value 是参数的类型定义
						// 你可以指定格式，添加描述信息和示例，但是描述要简洁，你应该在更长的 Feed 描述中说明参数
						author: t.String({
							// format: "uri"
							description: "Author name to filter articles.",
							examples: ["xiaofei", "cxbii"],
						}),

						// 或是者使用枚举类型来限定参数值
						// category: t.Optional(
						// 	t.UnionEnum(["news", "updates", "releases"], {
						// 		description: "Category of the feed.",
						// 		examples: ["news", "updates"],
						// 	}),
						// ),
					}),
					///
					/// 但是不要定义 body query 等其他部分，定义这些部分违反了设计原则，还可能出现错误
					///
				},
			),
	);
