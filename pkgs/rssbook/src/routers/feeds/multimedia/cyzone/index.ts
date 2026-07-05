import type { Data, DataItem } from "@/types";
import type { Cache } from "@/utils";
import { Source, t } from "@/utils";

type CyzoneItem = {
	author?: string;
	author_name?: string;
	category?: string;
	category_name?: string;
	content?: string;
	content_id?: string;
	description?: string;
	published_at?: number;
	tags?: string;
	title?: string;
	url?: string;
	votes?: number;
};

type CyzoneItemWrapper = {
	item?: CyzoneItem;
};

const ROOT_URL = "https://www.cyzone.cn";
const API_URL = "https://api1.cyzone.cn";

async function getInfo(
	url: string,
	ofetch: (url: string, options?: object) => Promise<unknown>,
	load: typeof import("cheerio").load,
): Promise<Partial<Data>> {
	try {
		const response = (await ofetch(url, { responseType: "text" })) as string;
		const $ = load(response);
		const avatar = $("img.avatar").attr("src")?.split("?")[0];
		const icon = $("link[rel='icon']").attr("href");
		const image = $("div.logo img").attr("src");

		return {
			author: { name: $("meta[name='app-mobile-web-app-title']").attr("content") ?? "" },
			description: $("meta[name='description']").attr("content"),
			favicon: icon ? new URL(icon, ROOT_URL).href : undefined,
			image: avatar || (image ? new URL(image, ROOT_URL).href : undefined),
			language: "zh-CN",
			link: url,
			title: $("title").text(),
		};
	} catch {
		return {
			language: "zh-CN",
			link: url,
			title: "Cyzone",
		};
	}
}

async function processItems(
	apiUrl: string,
	params: Record<string, string>,
	ofetch: (url: string, options?: object) => Promise<unknown>,
	load: (html: string) => ReturnType<typeof import("cheerio")["load"]>,
	cache: Cache,
): Promise<DataItem[]> {
	const response = (await ofetch(apiUrl, {
		query: { size: "5", ...params },
		responseType: "json",
	})) as {
		data?:
			| (CyzoneItem | CyzoneItemWrapper)[]
			| {
					article?: (CyzoneItem | CyzoneItemWrapper)[];
					data?: (CyzoneItem | CyzoneItemWrapper)[];
			  };
	};

	const data = response.data ?? [];
	const rawItems = Array.isArray(data) ? data : (data.article ?? data.data ?? []);

	return await Promise.all(
		rawItems.slice(0, 5).map(async (raw) => {
			const item = "item" in raw && raw.item ? raw.item : (raw as CyzoneItem);
			const contentId = item.content_id;
			const baseItem: DataItem = {
				category: [item.category_name, ...(item.tags?.split(",") ?? [])]
					.filter(Boolean)
					.map((name) => ({ name })),
				date: new Date((item.published_at ?? Date.now() / 1000) * 1000),
				description: item.description,
				link: item.url?.startsWith("//")
					? `https:${item.url}`
					: (item.url ?? `${ROOT_URL}/article/${contentId}.html`),
				title: item.title ?? "Untitled",
			};

			if (!contentId) return baseItem;

			return cache.tryGet<DataItem>(`cyzone:${contentId}`, async () => {
				const detailResponse = (await ofetch(`${API_URL}/v2/content/app_content/show`, {
					body: { content_id: contentId },
					method: "POST",
					responseType: "json",
				})) as { data?: CyzoneItem };
				const data = detailResponse.data ?? {};

				const categories = [
					data.category,
					...(baseItem.category?.map((c) => c.name) ?? []),
					...(data.tags?.split(",") ?? []),
				].filter((name): name is string => !!name);

				const $content = load(data.content ?? "");
				$content("img").each((_, el) => {
					const $el = $content(el);
					const src = $el.attr("src");
					if (src) {
						$el.attr("src", src.split("?")[0]);
					} else {
						$el.remove();
					}
				});

				const contentHtml = $content("body").html() ?? $content.html() ?? data.description;

				return {
					author: [
						{ name: data.author_name ?? data.author ?? item.author_name ?? item.author ?? "" },
					],
					category: [...new Set(categories)].map((name) => ({ name })),
					date: new Date((data.published_at ?? item.published_at ?? Date.now() / 1000) * 1000),
					description: contentHtml,
					id: `cyzone-${contentId}`,
					link: `${ROOT_URL}/article/${contentId}.html`,
					title: data.title ?? item.title ?? "Untitled",
				} satisfies DataItem;
			});
		}),
	);
}

export default new Source({
	description: "News feeds from Cyzone (创业邦).",
	domain: "cyzone.cn",
	slug: "cyzone",
	title: "Cyzone",
})
	.feed(
		{
			description: "Fetch articles from a Cyzone channel.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Channel",
		},
		(app) =>
			app.get(
				"/channel/:id",
				async ({ cache, load, ofetch, params: { id = "news" } }) => {
					const apiPath =
						id === "news" ? "v2/content/channel/getArticle" : "v2/content/channel/detail";
					const apiUrl = `${API_URL}/${apiPath}`;
					const currentUrl = `${ROOT_URL}/channel/${id}`;
					const params: Record<string, string> = id === "news" ? {} : { channel_id: id };

					const item = await cache.tryGet<DataItem[]>(apiUrl + id, async () =>
						processItems(apiUrl, params, ofetch, load, cache),
					);

					const info = await getInfo(currentUrl, ofetch, load);

					return {
						...info,
						item,
						language: "zh-CN",
						link: currentUrl,
						title: info.title ?? `Cyzone - ${id}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						id: t.String({
							default: "news",
							description: "Channel id, for example news, 5, 14, 13, or 8.",
						}),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch articles from a Cyzone author.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Author",
		},
		(app) =>
			app.get(
				"/author/:id",
				async ({ cache, load, ofetch, params: { id } }) => {
					const apiUrl = `${API_URL}/v2/author/author/detail`;
					const currentUrl = `${ROOT_URL}/author/${id}`;

					const item = await cache.tryGet<DataItem[]>(apiUrl + id, async () =>
						processItems(apiUrl, { author_id: id }, ofetch, load, cache),
					);

					const info = await getInfo(currentUrl, ofetch, load);

					return {
						...info,
						item,
						language: "zh-CN",
						link: currentUrl,
						title: info.title ?? `Cyzone - Author ${id}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						id: t.String({ description: "Author id." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch articles from a Cyzone label.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Label",
		},
		(app) =>
			app.get(
				"/label/:label",
				async ({ cache, load, ofetch, params: { label } }) => {
					const apiUrl = `${API_URL}/v2/content/tag/tagList`;
					const currentUrl = `${ROOT_URL}/label/${encodeURIComponent(label)}`;

					const item = await cache.tryGet<DataItem[]>(apiUrl + label, async () =>
						processItems(apiUrl, { tag: label }, ofetch, load, cache),
					);

					const info = await getInfo(currentUrl, ofetch, load);

					return {
						...info,
						item,
						language: "zh-CN",
						link: currentUrl,
						title: info.title ?? `Cyzone - Label ${label}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						label: t.String({ description: "Label name." }),
					}),
				},
			),
	);
