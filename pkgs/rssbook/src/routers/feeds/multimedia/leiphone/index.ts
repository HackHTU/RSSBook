import type { Data, DataItem } from "@/types";
import type { Cache } from "@/utils";
import { Source, t } from "@/utils";

const ROOT_URL = "https://www.leiphone.com";

async function enrichLeiphoneArticle(
	link: string,
	ofetch: (url: string, options?: object) => Promise<unknown>,
	load: (html: string) => ReturnType<typeof import("cheerio")["load"]>,
	cache: Cache,
): Promise<DataItem> {
	return cache.tryGet<DataItem>(link, async () => {
		const html = (await ofetch(link, { responseType: "text" })) as string;
		const $ = load(html);

		let description = "";
		const topImg = $(".top-img").html();
		if (topImg) {
			description += topImg;
		}

		const lead = $(".article-lead").text();
		if (lead) {
			description += `<p>${lead}</p>`;
		}

		const content = $(".lph-article-comView").html();
		if (content) {
			description += content;
		}

		return {
			author: [{ name: $(".aut > a").text().trim() }],
			date: new Date($(".time").text().trim()),
			description,
			link,
			title: $(".headTit").text().trim(),
		} satisfies DataItem;
	});
}

export default new Source({
	description: "Article feeds from Leiphone (雷锋网).",
	domain: "leiphone.com",
	slug: "leiphone",
	title: "Leiphone",
})
	.feed(
		{
			description: "Fetch latest articles from the Leiphone home page.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Home",
		},
		(app) =>
			app.get("/index", async ({ cache, load, ofetch }) => {
				const url = ROOT_URL;
				const item = await cache.tryGet<DataItem[]>(url, async () => {
					const html = (await ofetch(url, { responseType: "text" })) as string;
					const $ = load(html);

					const links = $(".word > h3 > a")
						.slice(0, 10)
						.toArray()
						.map((anchor) => $(anchor).attr("href"))
						.filter((href): href is string => !!href);

					return await Promise.all(
						links.map((link) => enrichLeiphoneArticle(link, ofetch, load, cache)),
					);
				});

				return {
					description: "Latest Leiphone articles.",
					item,
					language: "zh-CN",
					link: url,
					title: "Leiphone",
				} satisfies Data;
			}),
	)
	.feed(
		{
			description: "Fetch Leiphone industry newsflash.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Newsflash",
		},
		(app) =>
			app.get("/newsflash", async ({ cache, load, ofetch }) => {
				const url = `${ROOT_URL}/site/YejieKuaixun`;
				const item = await cache.tryGet<DataItem[]>(url, async () => {
					const response = await ofetch<{ article?: { url?: string }[] }>(url, {
						responseType: "json",
					});
					const links = (response.article ?? [])
						.map((article) => article.url)
						.filter((href): href is string => !!href);

					return await Promise.all(
						links.map((link) => enrichLeiphoneArticle(link, ofetch, load, cache)),
					);
				});

				return {
					description: "Leiphone industry newsflash.",
					item,
					language: "zh-CN",
					link: url,
					title: "Leiphone Newsflash",
				} satisfies Data;
			}),
	)
	.feed(
		{
			description: "Fetch Leiphone articles by category.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Category",
		},
		(app) =>
			app.get(
				"/category/:keyword",
				async ({ cache, load, ofetch, params: { keyword } }) => {
					const url = `${ROOT_URL}/category/${keyword}`;
					const item = await cache.tryGet<DataItem[]>(url, async () => {
						const html = (await ofetch(url, { responseType: "text" })) as string;
						const $ = load(html);

						const links = $(".word > h3 > a")
							.slice(0, 10)
							.toArray()
							.map((anchor) => $(anchor).attr("href"))
							.filter((href): href is string => !!href);

						return await Promise.all(
							links.map((link) => enrichLeiphoneArticle(link, ofetch, load, cache)),
						);
					});

					return {
						description: `Leiphone category ${keyword}.`,
						item,
						language: "zh-CN",
						link: url,
						title: `Leiphone - ${keyword}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						keyword: t.String({ description: "Category keyword." }),
					}),
				},
			),
	);
