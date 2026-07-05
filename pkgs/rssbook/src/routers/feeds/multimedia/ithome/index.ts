import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

const CATEGORIES: Record<string, string> = {
	android: "Android",
	digi: "Digital",
	ipad: "iPad",
	iphone: "iPhone",
	it: "IT News",
	next: "Smart Era",
	soft: "Software",
	win10: "Windows 10",
	win11: "Windows 11",
};

const TW_CATEGORIES: Record<string, string> = {
	"big-data": "Big Data",
	cloud: "Cloud",
	devops: "DevOps",
	news: "News",
	security: "Security",
};

const FILE_LINK_RE = /\.(pdf|docx?|xlsx?|xls|zip|rar|png|jpe?g|gif|bmp|mp4|mp3|txt)$/i;

function shouldFetchArticle(link: string, rootURL: string): boolean {
	if (!link || FILE_LINK_RE.test(link)) return false;

	try {
		return new URL(link).origin === new URL(rootURL).origin;
	} catch {
		return false;
	}
}

async function enrichArticle(
	item: DataItem,
	ofetch: (url: string, options?: object) => Promise<unknown>,
	load: typeof import("cheerio").load,
): Promise<DataItem> {
	if (!shouldFetchArticle(item.link, "https://www.ithome.com")) return item;

	try {
		const html = (await ofetch(item.link, { responseType: "text" })) as string;
		const $ = load(html);
		const post = $("#paragraph");

		post.find("img[data-original]").each((_, ele) => {
			const $ele = $(ele);
			const original = $ele.attr("data-original");
			if (original) {
				$ele.attr("src", original);
			}
			$ele.removeAttr("class");
			$ele.removeAttr("data-original");
		});

		const contentHTML = post.html();
		if (contentHTML) {
			item.description = contentHTML;
		}

		const pubTime = $("#pubtime_baidu").text().trim();
		if (pubTime) {
			item.date = new Date(`${pubTime} GMT+8`);
		}

		const author = $(".author_baidu > strong").text().trim();
		if (author) {
			item.author = [{ name: author }];
		}
	} catch {
		return item;
	}

	return item;
}

export default new Source({
	description: "Category news feeds from IT Home (IT之家).",
	domain: "ithome.com",
	slug: "ithome",
	title: "IT Home",
})
	.feed(
		{
			description: "Fetch category news from IT Home with full article content.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Category News",
		},
		(app) =>
			app.get(
				"/:category",
				async ({ cache, date, load, ofetch, params: { category }, toAbsoluteURL }) => {
					const link = `https://${category}.ithome.com/`;
					const item = await cache.tryGet<DataItem[]>(link, async () => {
						const html = (await ofetch(link, { responseType: "text" })) as string;
						const $ = load(html);
						const listItems = $("#list h2 a, .list h2 a")
							.toArray()
							.map((anchor) => {
								const element = $(anchor);
								return {
									date: date(new Date()),
									link: toAbsoluteURL(element.attr("href") ?? "", link),
									title: element.text().trim(),
								} satisfies DataItem;
							})
							.filter((entry) => entry.title && entry.link)
							.slice(0, 10);

						return await Promise.all(
							listItems.map((listItem) => enrichArticle(listItem, ofetch, load)),
						);
					});

					return {
						description: `IT Home ${CATEGORIES[category] ?? category} news.`,
						item,
						language: "zh-CN",
						link,
						title: `IT Home - ${CATEGORIES[category] ?? category}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						category: t.String({
							default: "it",
							description: "IT Home category, for example it, soft, android, or iphone.",
						}),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch IT Home ranking lists.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Ranking",
		},
		(app) =>
			app.get(
				"/ranking/:type",
				async ({ cache, date, load, ofetch, params: { type } }) => {
					const id =
						type === "24h"
							? "d-1"
							: type === "7days"
								? "d-2"
								: type === "monthly"
									? "d-3"
									: undefined;
					if (!id) {
						throw new Error(`Invalid ranking type: ${type}`);
					}

					const rankingUrl = "https://www.ithome.com/block/rank.html";
					const item = await cache.tryGet<DataItem[]>(rankingUrl + type, async () => {
						const html = (await ofetch(rankingUrl, { responseType: "text" })) as string;
						const $ = load(html);

						const listItems = $(`#${id} > li`)
							.toArray()
							.map((li) => {
								const $li = $(li);
								return {
									date: date(new Date()),
									link: $li.find("a").attr("href") ?? "",
									title: $li.find("a").text().trim(),
								} satisfies DataItem;
							})
							.filter((entry) => entry.title && entry.link);

						return await Promise.all(
							listItems.map((listItem) => enrichArticle(listItem, ofetch, load)),
						);
					});

					const titles: Record<string, string> = {
						"7days": "7 Days Hot",
						"24h": "24h Hot",
						monthly: "Monthly Hot",
					};

					return {
						description: `IT Home ${titles[type]} ranking.`,
						item,
						language: "zh-CN",
						link: "https://www.ithome.com",
						title: `IT Home - ${titles[type]}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						type: t.String({
							description: "Ranking type: 24h, 7days, or monthly.",
						}),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch IT Home articles by tag.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Tag",
		},
		(app) =>
			app.get(
				"/tag/:tag",
				async ({ cache, date, load, ofetch, params: { tag } }) => {
					const url = `https://www.ithome.com/tag/${tag}`;
					const item = await cache.tryGet<DataItem[]>(url, async () => {
						const html = (await ofetch(url, { responseType: "text" })) as string;
						const $ = load(html);

						const listItems = $("ul.bl > li")
							.toArray()
							.map((li) => {
								const $li = $(li);
								const timestamp = $li.find("div.c").attr("data-ot");
								return {
									date: timestamp ? date(timestamp, 8) : date(new Date()),
									link: $li.find("h2 > a").attr("href") ?? "",
									title: $li.find("h2 > a").text().trim(),
								} satisfies DataItem;
							})
							.filter((entry) => entry.title && entry.link);

						return await Promise.all(
							listItems.map((listItem) => enrichArticle(listItem, ofetch, load)),
						);
					});

					return {
						description: `IT Home articles tagged ${tag}.`,
						item,
						language: "zh-CN",
						link: url,
						title: `IT Home - #${tag}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						tag: t.String({ description: "Tag name." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch feeds from IT Home Taiwan.",
			language: "zh-TW",
			maintainer: { name: "RSSBook" },
			title: "Taiwan Feeds",
		},
		(app) =>
			app.get(
				"/tw/:caty",
				async ({ cache, date, load, ofetch, params: { caty } }) => {
					const baseUrl = "https://www.ithome.com.tw";
					const currentUrl = `${baseUrl}/${caty}/feeds`;
					const item = await cache.tryGet<DataItem[]>(currentUrl, async () => {
						const html = (await ofetch(currentUrl, { responseType: "text" })) as string;
						const $ = load(html);
						const name = $("a.active-trail").text().trim() || TW_CATEGORIES[caty] || caty;

						return await Promise.all(
							$(".title a")
								.toArray()
								.map((anchor) => {
									const $anchor = $(anchor);
									const link = `${baseUrl}${$anchor.attr("href")}`;
									return cache.tryGet<DataItem>(link, async () => {
										const articleHtml = (await ofetch(link, { responseType: "text" })) as string;
										const $article = load(articleHtml);
										return {
											author: [{ name: $article(".author a").text().trim() }],
											category: [{ name }],
											date: date($article(".created").text().trim(), 8),
											description: $article("article").eq(0).html() ?? "",
											link,
											title: $article(".page-header").text().trim(),
										} satisfies DataItem;
									});
								}),
						);
					});

					return {
						description: `IT Home Taiwan ${caty} feeds.`,
						item,
						language: "zh-TW",
						link: currentUrl,
						title: `${TW_CATEGORIES[caty] ?? caty} | IT Home Taiwan`,
					} satisfies Data;
				},
				{
					params: t.Object({
						caty: t.String({
							description:
								"Taiwan category, for example news, big-data, cloud, devops, or security.",
						}),
					}),
				},
			),
	);
