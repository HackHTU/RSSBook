import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

type GeekparkAuthor = {
	nickname?: string;
	realname?: string;
};

type GeekparkColumn = {
	banner_url?: string;
	description?: string;
	title?: string;
};

type GeekparkPost = {
	abstract?: string;
	authors?: GeekparkAuthor[];
	column?: GeekparkColumn;
	content?: string;
	cover_url?: string;
	id: number;
	published_timestamp?: number;
	tags?: string[];
	title: string;
	updated_at?: string;
};

type GeekparkPostWrapper = {
	post?: GeekparkPost;
};

const ROOT_URL = "https://geekpark.net";
const API_URL = "https://mainssl.geekpark.net";

function buildDescription(intro?: string, content?: string, image?: string): string {
	let description = "";

	if (image) {
		description += `<img src="${image}" alt="Cover" style="display: block; margin: 0 auto;"><br>`;
	}

	if (intro) {
		description += `<p>${intro}</p>`;
	}

	if (content) {
		description += content;
	}

	return description;
}

function unwrapPost(item: GeekparkPostWrapper | GeekparkPost): GeekparkPost {
	return "post" in item && item.post ? item.post : (item as GeekparkPost);
}

export default new Source({
	description: "Article feeds from Geekpark (极客公园).",
	domain: "geekpark.net",
	slug: "geekpark",
	title: "Geekpark",
})
	.feed(
		{
			description: "Fetch latest articles from the Geekpark home page.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Home",
		},
		(app) =>
			app.get("/index", async ({ cache, date, load, ofetch }) => {
				const apiUrl = `${API_URL}/api/v2`;
				const [apiResponse, pageResponse] = await Promise.allSettled([
					ofetch<{ homepage_posts?: GeekparkPostWrapper[] }>(apiUrl, { responseType: "json" }),
					ofetch(ROOT_URL, { responseType: "text" }) as Promise<string>,
				]);

				const homepagePosts =
					apiResponse.status === "fulfilled" ? (apiResponse.value.homepage_posts ?? []) : [];
				const pageHtml = pageResponse.status === "fulfilled" ? pageResponse.value : "";
				const $ = load(pageHtml);
				const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
					return await Promise.all(
						homepagePosts.slice(0, 20).map(async (wrapper) => {
							const post = unwrapPost(wrapper);
							const detail = await cache.tryGet<GeekparkPost>(
								`geekpark:post:${post.id}`,
								async () => {
									const detailResponse = await ofetch<{ post?: GeekparkPost }>(
										`${API_URL}/api/v1/posts/${post.id}`,
										{
											responseType: "json",
										},
									);
									return (detailResponse.post ?? post) as GeekparkPost;
								},
							);

							const guid = `geekpark-${detail.id}`;
							return {
								author: [
									{ name: detail.authors?.map((a) => a.realname ?? a.nickname).join("/") ?? "" },
								],
								category: [...new Set([...(detail.tags ?? []), detail.column?.title])]
									.filter((name): name is string => !!name)
									.map((name) => ({ name })),
								date: date((detail.published_timestamp ?? Date.now() / 1000) * 1000),
								description: buildDescription(detail.abstract, detail.content, detail.cover_url),
								id: guid,
								image: detail.cover_url,
								link: `${ROOT_URL}/news/${detail.id}`,
								title: detail.title,
							} satisfies DataItem;
						}),
					);
				});

				return {
					author: { name: $("meta[property='og:site_name']").attr("content") ?? "Geekpark" },
					description:
						$("meta[property='og:description']").attr("content") ?? "Latest Geekpark articles.",
					image: $("meta[name='og:image']").attr("content")
						? `https:${$("meta[name='og:image']").attr("content")}`
						: undefined,
					item,
					language: "zh-CN",
					link: ROOT_URL,
					title: $("title").text() || "Geekpark",
				} satisfies Data;
			}),
	)
	.feed(
		{
			description: "Fetch articles from a Geekpark column.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Column",
		},
		(app) =>
			app.get(
				"/column/:column",
				async ({ cache, date, ofetch, params: { column } }) => {
					const apiUrl = `${API_URL}/api/v1/columns/${column}`;
					const response = await ofetch<{
						column?: GeekparkColumn & { posts?: GeekparkPostWrapper[] };
					}>(apiUrl, {
						responseType: "json",
					});

					const columnData = response.column ?? {};
					const item = await cache.tryGet<DataItem[]>(`${apiUrl}items`, async () => {
						return await Promise.all(
							(columnData.posts ?? []).slice(0, 20).map(async (wrapper) => {
								const post = unwrapPost(wrapper);
								const detail = await cache.tryGet<GeekparkPost>(
									`geekpark:post:${post.id}`,
									async () => {
										const detailResponse = await ofetch<{ post?: GeekparkPost }>(
											`${API_URL}/api/v1/posts/${post.id}`,
											{
												responseType: "json",
											},
										);
										return (detailResponse.post ?? post) as GeekparkPost;
									},
								);

								const guid = `geekpark-${detail.id}`;
								return {
									author: [
										{ name: detail.authors?.map((a) => a.realname ?? a.nickname).join("/") ?? "" },
									],
									category: [...new Set([...(detail.tags ?? []), detail.column?.title])]
										.filter((name): name is string => !!name)
										.map((name) => ({ name })),
									date: date((detail.published_timestamp ?? Date.now() / 1000) * 1000),
									description: buildDescription(detail.abstract, detail.content, detail.cover_url),
									id: guid,
									image: detail.cover_url,
									link: `${ROOT_URL}/news/${detail.id}`,
									title: detail.title,
								} satisfies DataItem;
							}),
						);
					});

					return {
						description: columnData.description,
						image: columnData.banner_url,
						item,
						language: "zh-CN",
						link: `${ROOT_URL}/column/${column}`,
						title: `${columnData.title ?? column} | Geekpark`,
					} satisfies Data;
				},
				{
					params: t.Object({
						column: t.String({ description: "Column id, for example 179, 304, or 305." }),
					}),
				},
			),
	);
