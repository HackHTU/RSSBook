import type { Data, DataItem } from "@/types";
import type { Cache } from "@/utils";
import { Source, t } from "@/utils";

const ROOT_URL = "https://www.pingwest.com";

type TagInfo = {
	tagId: string;
	tagName: string;
};

type UserInfo = {
	realUid: string;
	userAvatar?: string;
	userName: string;
	userSign: string;
};

function modifiedLink(link?: string): string {
	if (!link) return "";
	return link.startsWith("http") ? link : `https:${link}`;
}

function cleanImageUrl(src?: string): string | undefined {
	if (!src) return undefined;
	return src.split("?x-")[0];
}

async function getFullArticle(
	link: string,
	ofetch: (url: string, options?: object) => Promise<unknown>,
	load: (html: string) => ReturnType<typeof import("cheerio")["load"]>,
	cache: Cache,
): Promise<string> {
	return cache.tryGet<string>(link, async () => {
		const html = (await ofetch(link, { responseType: "text" })) as string;
		const $ = load(html);

		$("img").each((_, ele) => {
			const $ele = $(ele);
			const src = $ele.attr("src");
			if (src?.includes("?x-")) {
				$ele.attr("src", src.split("?x-")[0]);
			}
		});

		return $("section .article-style").html() ?? "";
	});
}

function statusListParser(
	listHtml: string,
	load: (html: string) => ReturnType<typeof import("cheerio")["load"]>,
	date: (input: string | number | Date, timezone?: number) => Date,
): DataItem[] {
	const $ = load(listHtml);

	return $(".item")
		.toArray()
		.map((ele) => {
			const timestamp = (ele.attribs as { pt?: string }).pt;
			const $item = load($.html(ele));
			const mainNode = $item(".news-detail");
			const imgsStr = mainNode
				.find("img")
				.toArray()
				.map((img) => `<img src="${cleanImageUrl((img.attribs as { src?: string }).src)}">`)
				.join("<br>");
			const link = mainNode.find(".content a").first().attr("href");
			const content = mainNode
				.text()
				.trim()
				.replace(/展开全文$/, "");

			return {
				date: timestamp ? date(Number(timestamp) * 1000) : date(new Date()),
				description: [content, imgsStr].filter(Boolean).join("<br>"),
				link: modifiedLink(link),
				title: content,
			} satisfies DataItem;
		});
}

async function articleListParser(
	listHtml: string,
	needFullText: boolean,
	ofetch: (url: string, options?: object) => Promise<unknown>,
	load: (html: string) => ReturnType<typeof import("cheerio")["load"]>,
	date: (input: string | number | Date, timezone?: number) => Date,
	cache: Cache,
): Promise<DataItem[]> {
	const $ = load(listHtml);

	return await Promise.all(
		$(".item")
			.toArray()
			.map(async (ele) => {
				const $item = load($.html(ele));
				const isNewsflash = $item(".news-detail").children().length <= 2;

				const titleNode = isNewsflash
					? $item(".news-detail .content .text")
					: $item(".news-detail .title");
				const authorNode = isNewsflash
					? $item(".news-detail .content .op")
					: $item(".news-detail .author");

				const title = titleNode.find("a").text().trim();
				const prefixUrl = titleNode.find("a").attr("href");
				const link = modifiedLink(prefixUrl);
				const imgUrl = cleanImageUrl($item(".news-img img").attr("src"));
				const author = authorNode.children().first().text().trim();
				const timestamp = authorNode.find(".time").text().trim();

				let itemDate = date(timestamp, 8);
				if (!timestamp) {
					itemDate = date(new Date());
				}

				let description = $item(".desc").text().trim();
				if (needFullText && link) {
					description += await getFullArticle(link, ofetch, load, cache);
				} else if (imgUrl) {
					description += `<br><img src="${imgUrl}">`;
				}

				return {
					author: author ? [{ name: author }] : undefined,
					date: itemDate,
					description,
					link,
					title,
				} satisfies DataItem;
			}),
	);
}

export default new Source({
	description: "News feeds from Pingwest (品玩).",
	domain: "pingwest.com",
	slug: "pingwest",
	title: "Pingwest",
})
	.feed(
		{
			description: "Fetch real-time news from Pingwest status.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Status",
		},
		(app) =>
			app.get("/status", async ({ cache, date, load, ofetch }) => {
				const url = `${ROOT_URL}/api/state/list?page=1`;
				const item = await cache.tryGet<DataItem[]>(url, async () => {
					const response = await ofetch<{ data?: { list?: string } }>(url, {
						headers: { Referer: ROOT_URL },
						responseType: "json",
					});

					const $ = load(response.data?.list ?? "");

					return $("section.item")
						.toArray()
						.map((ele) => {
							const timestamp = (ele.attribs as { "data-t"?: string })["data-t"];
							const $item = load($.html(ele));
							const rightNode = $item(".news-info");
							const tag = rightNode.find(".item-tag-list").text().trim();
							const title = rightNode.find(".title").text().trim();
							const link = rightNode.find("a").last().attr("href");
							let description = rightNode.text().trim();
							const imgUrl = $item(".news-img img").attr("src");

							if (imgUrl) {
								description += `<br><img src="${cleanImageUrl(imgUrl)}">`;
							}

							return {
								category: tag ? [{ name: tag }] : undefined,
								date: timestamp ? date(Number(timestamp) * 1000) : date(new Date()),
								description,
								link: modifiedLink(link),
								title: title || tag,
							} satisfies DataItem;
						});
				});

				return {
					description: "Pingwest real-time news.",
					item,
					language: "zh-CN",
					link: `${ROOT_URL}/status`,
					title: "Pingwest - Status",
				} satisfies Data;
			}),
	)
	.feed(
		{
			description: "Fetch Pingwest articles by tag.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Tag",
		},
		(app) =>
			app.get(
				"/tag/:tag/:type/:option?",
				async ({ cache, date, load, ofetch, params: { tag, type, option } }) => {
					const tagUrl = `${ROOT_URL}/tag/${tag}`;
					const needFullText = option === "fulltext";
					const tagInfo = await cache.tryGet<TagInfo>(`pingwest:tag:${tag}`, async () => {
						const res = (await ofetch(tagUrl, {
							headers: { Referer: ROOT_URL },
							responseType: "text",
						})) as string;
						const $ = load(res);
						return {
							tagId: $(".tag-detail").attr("data-id") ?? "",
							tagName: $(".tag-detail .info .title").text().trim(),
						};
					});

					if (!tagInfo.tagId) {
						throw new Error(`Pingwest tag not found: ${tag}`);
					}

					const apiUrl = `${ROOT_URL}/api/tag_article_list?id=${tagInfo.tagId}&type=${Number(type) - 1}`;
					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const response = await ofetch<{ data?: { list?: string } }>(apiUrl, {
							headers: { Referer: ROOT_URL },
							responseType: "json",
						});

						return await articleListParser(
							response.data?.list ?? "",
							needFullText,
							ofetch,
							load,
							date,
							cache,
						);
					});

					return {
						description: `Pingwest tag ${tagInfo.tagName || tag}.`,
						item,
						language: "zh-CN",
						link: tagUrl,
						title: `Pingwest - ${tagInfo.tagName || tag}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						option: t.Optional(
							t.String({ description: "Set to 'fulltext' for full article output." }),
						),
						tag: t.String({ description: "Tag name or id." }),
						type: t.String({ description: "Content type: 1 for latest, 2 for hot." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch Pingwest articles or status updates by user.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "User",
		},
		(app) =>
			app.get(
				"/user/:uid/:type?/:option?",
				async ({ cache, date, load, ofetch, params: { uid, type = "article", option } }) => {
					const aimUrl = `${ROOT_URL}/user/${uid}/${type}`;
					const needFullText = option === "fulltext";

					const userInfo = await cache.tryGet<UserInfo>(`pingwest:user:${uid}`, async () => {
						const res = (await ofetch(aimUrl, {
							headers: { Referer: ROOT_URL },
							responseType: "text",
						})) as string;
						const $ = load(res);
						const userInfoNode = $("#J_userId");
						return {
							realUid: userInfoNode.attr("data-user-id") ?? "",
							userAvatar: $("#J_userAvatar").attr("src"),
							userName: userInfoNode.text().trim(),
							userSign: $("#J_userSign").text().trim(),
						};
					});

					if (!userInfo.realUid) {
						throw new Error(`Pingwest user not found: ${uid}`);
					}

					const apiUrl = `${ROOT_URL}/api/user_data?page=1&user_id=${userInfo.realUid}&tab=${type}`;
					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const response = await ofetch<{ data?: { list?: string } }>(apiUrl, {
							headers: { Referer: ROOT_URL },
							responseType: "json",
						});

						if (type === "state") {
							return statusListParser(response.data?.list ?? "", load, date);
						}

						return await articleListParser(
							response.data?.list ?? "",
							needFullText,
							ofetch,
							load,
							date,
							cache,
						);
					});

					const typeLabel = type === "state" ? "States" : "Articles";

					return {
						description: userInfo.userSign,
						image: userInfo.userAvatar,
						item,
						language: "zh-CN",
						link: aimUrl,
						title: `Pingwest - ${userInfo.userName} - ${typeLabel}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						option: t.Optional(
							t.String({ description: "Set to 'fulltext' for full article output." }),
						),
						type: t.Optional(
							t.String({ default: "article", description: "Content type: article or state." }),
						),
						uid: t.String({ description: "User id." }),
					}),
				},
			),
	);
