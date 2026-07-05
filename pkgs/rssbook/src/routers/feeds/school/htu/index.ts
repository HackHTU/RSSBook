import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

const ROOT_URL = "https://www.htu.edu.cn/";
const FILE_LINK_RE = /\.(pdf|docx?|xlsx?|xls|zip|rar|png|jpe?g|gif|bmp|mp4|mp3|txt)$/i;

type ParsedItem = DataItem & {
	enclosure?: {
		url: string;
	};
};

export default new Source({
	description:
		"Official website, academic affairs, and campus news from Henan Normal University (河南师范大学).",
	domain: "www.htu.edu.cn",
	slug: "htu",
	title: "Henan Normal University",
})
	.feed(
		{
			description:
				"Fetch news from a specified Henan Normal University website category and enrich each item with full article content.",
			fulltext: true,
			language: "zh-CN",
			maintainer: { name: "HackHTU" },
			title: "Official Website News",
			withImage: "If-Present",
		},
		(app) =>
			app.get(
				"/www/:category",
				async ({ cache, date, formatHTML, load, ofetch, params: { category }, toAbsoluteURL }) => {
					const link = `${ROOT_URL}${category}/list.htm`;
					const data = await cache.tryGet(link, async () => {
						const html = await ofetch(link, { responseType: "text" });
						const $ = load(html);
						const channel = $("title").text().trim();

						const items = $("ul.news_list li.news")
							.toArray()
							.map((item) => {
								const element = $(item);
								const href = element.find("div.wz a").first().attr("href") ?? "";
								const imgSrc =
									element.find("div.imgs img").first().attr("src") ??
									element.find("div.wz a img").first().attr("src") ??
									"";
								const image = imgSrc ? toAbsoluteURL(imgSrc, ROOT_URL) : undefined;

								return {
									date: date(element.find("div.wz div.news_time").first().text().trim()),
									description:
										element.find("div.wz div.news_text").first().text().trim() || undefined,
									enclosure: image ? { url: image } : undefined,
									image,
									link: toAbsoluteURL(href, ROOT_URL),
									title: element.find("div.wz div.news_title").first().text().trim(),
								} satisfies ParsedItem;
							})
							.filter((item) => item.title && item.link);

						return {
							category: channel,
							description: channel,
							item: await withArticleContent(items, {
								formatHTML,
								load,
								ofetch,
								toAbsoluteURL,
							}),
							language: "zh-CN",
							link,
							title: `河南师范大学 - ${channel}`,
						} satisfies Data;
					});

					return data satisfies Data;
				},
				{
					params: t.Object({
						category: t.String({
							default: "8954",
							description: "Official website category ID, for example 8954.",
						}),
					}),
				},
			),
	)
	.feed(
		{
			description:
				"Fetch academic affairs notices from a specified Henan Normal University teaching category and enrich each item with full article content.",
			fulltext: true,
			language: "zh-CN",
			maintainer: { name: "HackHTU" },
			title: "Teaching Notices",
			withImage: "If-Present",
		},
		(app) =>
			app.get(
				"/teaching/:category",
				async ({ cache, date, formatHTML, load, ofetch, params: { category }, toAbsoluteURL }) => {
					const link = `${ROOT_URL}teaching/${category}/list.htm`;
					const data = await cache.tryGet(link, async () => {
						const html = await ofetch(link, { responseType: "text" });
						const $ = load(html);
						const channel = $("title").text().trim();

						const newsItems = $("ul.news_list li.news").toArray();
						const listItems = newsItems.length ? newsItems : $("ul.news_list li").toArray();
						const items = listItems
							.map((item) => {
								const element = $(item);
								const titleElement = element.find(".news_title").first();
								const linkElement = titleElement.find("a").first().length
									? titleElement.find("a").first()
									: element.find("a").first();
								const href = linkElement.attr("href") ?? "";
								const title = (titleElement.text() || linkElement.text()).trim();
								const timeRaw =
									element.find(".news_meta").first().text().trim() ||
									element
										.clone()
										.find("a")
										.remove()
										.end()
										.text()
										.trim()
										.match(/\d{4}-\d{2}-\d{2}/)?.[0] ||
									"";

								return {
									date: date(timeRaw),
									link: toAbsoluteURL(href, ROOT_URL),
									title,
								} satisfies ParsedItem;
							})
							.filter((item) => item.title && item.link);

						return {
							category: channel,
							description: channel,
							item: await withArticleContent(items, {
								formatHTML,
								load,
								ofetch,
								toAbsoluteURL,
							}),
							language: "zh-CN",
							link,
							title: `河南师范大学 - ${channel}`,
						} satisfies Data;
					});

					return data satisfies Data;
				},
				{
					params: t.Object({
						category: t.String({
							default: "3251",
							description: "Teaching category ID, for example 3251.",
						}),
					}),
				},
			),
	);

/**
 * Fetches same-site article pages to enrich list items with sanitized full text and first image.
 */
async function withArticleContent(
	items: ParsedItem[],
	utils: {
		formatHTML: (html: string, baseURL?: string) => string;
		load: typeof import("cheerio").load;
		ofetch: (url: string, options: { responseType: "text" }) => Promise<string>;
		toAbsoluteURL: (url: string, baseURL: string) => string;
	},
): Promise<DataItem[]> {
	return Promise.all(
		items.map(async (item) => {
			if (!shouldFetchArticle(item.link)) {
				return item;
			}

			try {
				const html = await utils.ofetch(item.link, { responseType: "text" });
				const $ = utils.load(html);
				const contentHTML = $("div.read").first().html();

				if (contentHTML) {
					item.description = utils.formatHTML(contentHTML, item.link);
				}

				if (!item.enclosure) {
					const imgSrc = $("div.read img").first().attr("src");
					if (imgSrc) {
						const image = utils.toAbsoluteURL(imgSrc, item.link);
						item.enclosure = { url: image };
						item.image = image;
					}
				}
			} catch {
				return item;
			}

			return item;
		}),
	);
}

function shouldFetchArticle(link: string): boolean {
	if (!link || FILE_LINK_RE.test(link)) {
		return false;
	}

	try {
		return new URL(link).origin === new URL(ROOT_URL).origin;
	} catch {
		return false;
	}
}
