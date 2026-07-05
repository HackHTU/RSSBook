import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

type IfanrAuthor = {
	name?: string;
};

type IfanrArticle = {
	buzz_original_url?: string;
	created_at?: number;
	created_by?: IfanrAuthor;
	id?: string | number;
	post_category?: string;
	post_content?: string;
	post_cover_image?: string;
	post_id?: string | number;
	post_title?: string;
	post_url?: string;
	published_at?: number;
	updated_at?: number;
};

const ROOT_URL = "https://www.ifanr.com";
const API_URL = "https://sso.ifanr.com";

const PATH_LIST: Record<string, string> = {
	产品: "product",
	早报: "ifanrnews",
	糖纸众测: "tangzhi-evaluation",
	评测: "review",
};

function buildArticleDescription(article: IfanrArticle): string {
	let description = "";

	if (article.post_cover_image) {
		description += `<img src="${article.post_cover_image}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
	}

	description += article.post_content ?? "";
	return description;
}

export default new Source({
	description: "Article feeds from iFanr (爱范儿).",
	domain: "ifanr.com",
	slug: "ifanr",
	title: "iFanr",
})
	.feed(
		{
			description: "Fetch latest articles from the iFanr home page.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Home",
		},
		(app) =>
			app.get("/index", async ({ cache, date, ofetch }) => {
				const apiUrl = `${API_URL}/api/v5/wp/web-feed/?limit=20&offset=0`;
				const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
					const response = await ofetch<{ objects?: IfanrArticle[] }>(apiUrl, {
						responseType: "json",
					});

					return await Promise.all(
						(response.objects ?? []).map(async (article) => {
							const detail = await cache.tryGet<IfanrArticle>(
								`ifanr:article:${article.post_id}`,
								async () => {
									const detailResponse = await ofetch<{ objects?: IfanrArticle[] }>(
										`${API_URL}/api/v5/wp/article/?post_id=${article.post_id}`,
										{ responseType: "json" },
									);
									return (detailResponse.objects?.[0] ?? {}) as IfanrArticle;
								},
							);

							return {
								author: [{ name: article.created_by?.name ?? detail.created_by?.name ?? "" }],
								date: date((article.created_at ?? Date.now() / 1000) * 1000),
								description: buildArticleDescription(detail),
								link: article.post_url ?? `${ROOT_URL}/${article.post_id}`,
								title: article.post_title ?? "Untitled",
							} satisfies DataItem;
						}),
					);
				});

				return {
					description: "Latest iFanr home page articles.",
					item,
					language: "zh-CN",
					link: ROOT_URL,
					title: "iFanr",
				} satisfies Data;
			}),
	)
	.feed(
		{
			description: "Fetch iFanr articles by category.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Category",
		},
		(app) =>
			app.get(
				"/category/:category",
				async ({ cache, date, ofetch, params: { category } }) => {
					const nameEncode = encodeURIComponent(decodeURIComponent(category));
					const apiUrl = `${API_URL}/api/v5/wp/article/?post_category=${nameEncode}&limit=20&offset=0`;
					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const response = await ofetch<{ objects?: IfanrArticle[] }>(apiUrl, {
							responseType: "json",
						});

						return (response.objects ?? []).map(
							(article) =>
								({
									author: [{ name: article.created_by?.name ?? "" }],
									date: date((article.published_at ?? Date.now() / 1000) * 1000),
									description: buildArticleDescription(article),
									link: article.post_url ?? `${ROOT_URL}/${article.post_id}`,
									title: article.post_title ?? "Untitled",
								}) satisfies DataItem,
						);
					});

					return {
						description: `iFanr category ${category}.`,
						item,
						language: "zh-CN",
						link: `${ROOT_URL}/category/${PATH_LIST[category] ?? category}`,
						title: `#${category} - iFanr`,
					} satisfies Data;
				},
				{
					params: t.Object({
						category: t.String({
							description: "Category name, for example 早报, 评测, 糖纸众测, or 产品.",
						}),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch iFanr digest buzz news.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Digest",
		},
		(app) =>
			app.get("/digest", async ({ date, load, ofetch }) => {
				const targetUrl = `${ROOT_URL}/digest`;
				const apiUrl = `${API_URL}/api/v5/wp/buzz?limit=20&offset=0`;

				const [response, targetResponse] = await Promise.all([
					ofetch<{ objects?: IfanrArticle[] }>(apiUrl, { responseType: "json" }),
					ofetch(targetUrl, { responseType: "text" }) as Promise<string>,
				]);

				const $ = load(targetResponse);
				const language = ($("html").attr("lang") ?? "zh-CN") as "zh-CN";

				const item = (response.objects ?? []).map(
					(article) =>
						({
							author: [{ name: article.created_by?.name ?? "" }],
							date: date((article.created_at ?? Date.now() / 1000) * 1000),
							description: article.post_content,
							id: `ifanr-digest-${article.post_id}`,
							link: `${ROOT_URL}/digest/${article.post_id}`,
							title: article.post_title ?? "Untitled",
						}) satisfies DataItem,
				);

				return {
					author: { name: $("meta[property='og:site_name']").attr("content") ?? "" },
					description: $("title").text(),
					image: $("img.c-header-navbar__logo").attr("src"),
					item,
					language,
					link: targetUrl,
					title: $("title").text(),
				} satisfies Data;
			}),
	);
