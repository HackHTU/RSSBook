import type { Data, DataItem } from "@/types";
import { FeedNotFoundError } from "@/utils/error";
import { Source, t } from "@/utils";

type SSPAIAuthor = {
	nickname?: string;
	slug?: string;
};

type SSPAIArticle = {
	author?: SSPAIAuthor;
	banner?: string;
	body?: string;
	body_extends?: { body?: string; title?: string }[];
	created_at?: number;
	id: number;
	promote_image?: string;
	released_at?: number;
	released_time?: number;
	summary?: string;
	title: string;
	topics?: { intro?: string; title?: string }[];
};

type SSPAISeries = {
	author?: SSPAIAuthor;
	banner?: string;
	banner_web?: string;
	created_at?: number;
	description?: string;
	id: number;
	intro?: string;
	price?: number;
	probation?: boolean;
	sell_status?: boolean;
	title: string;
	title_prefix?: string;
};

type SSPAITopic = {
	author?: SSPAIAuthor;
	banner?: string;
	id: number;
	intro?: string;
	released_at?: number;
	title: string;
};

type SSPAIActivity = {
	action?: string;
	author?: SSPAIAuthor;
	created_at?: number;
	data?: Record<string, unknown>;
	key?: string;
};

const ROOT_URL = "https://sspai.com";

async function fetchArticleDetail(
	id: number,
	slug: string | undefined,
	ofetch: <T>(url: string, options?: object) => Promise<T>,
): Promise<{
	body?: string;
	bodyExtends?: { body?: string; title?: string }[];
	promoteImage?: string;
}> {
	const infoUrl = slug
		? `${ROOT_URL}/api/v1/member/article/single/info/get?slug=${slug}&view=second&support_webp=true`
		: `${ROOT_URL}/api/v1/article/info/get?id=${id}&view=second&support_webp=true`;

	const response = await ofetch<{ data?: SSPAIArticle }>(infoUrl, {
		responseType: "json",
	});
	const articleData = (response.data ?? {}) as SSPAIArticle;

	return {
		body: articleData.body,
		bodyExtends: articleData.body_extends,
		promoteImage: articleData.promote_image,
	};
}

function buildDescription(article: {
	body?: string;
	bodyExtends?: { body?: string; title?: string }[];
	promoteImage?: string;
}): string {
	let description = "";

	if (article.promoteImage) {
		description += `<img src="${article.promoteImage}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
	}

	if (article.bodyExtends?.length) {
		for (const ext of article.bodyExtends) {
			description += `<h2>${ext.title ?? ""}</h2>${ext.body ?? ""}`;
		}
	}

	description += article.body ?? "";
	return description;
}

export default new Source({
	description: "Article feeds from SSPAI (少数派).",
	domain: "sspai.com",
	slug: "sspai",
	title: "SSPAI",
})
	.feed(
		{
			description: "Fetch latest articles from the SSPAI home page API.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Home Articles",
		},
		(app) =>
			app.get("/index", async ({ cache, date, ofetch }) => {
				const apiUrl = `${ROOT_URL}/api/v1/article/index/page/get?limit=20&offset=0&created_at=0`;
				const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
					const response = await ofetch<{ data?: SSPAIArticle[] }>(apiUrl, {
						responseType: "json",
					});
					return (response.data ?? []).map(
						(article) =>
							({
								author: [{ name: article.author?.nickname }],
								date: date((article.released_time ?? Date.now() / 1000) * 1000),
								description: article.summary,
								link: `${ROOT_URL}/post/${article.id}`,
								title: article.title,
							}) satisfies DataItem,
					);
				});

				return {
					description: "Latest SSPAI home page articles.",
					item,
					language: "zh-CN",
					link: ROOT_URL,
					title: "SSPAI Home Articles",
				} satisfies Data;
			}),
	)
	.feed(
		{
			description: "Fetch latest articles from the SSPAI Matrix community.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Matrix",
		},
		(app) =>
			app.get("/matrix", async ({ cache, date, ofetch }) => {
				const apiUrl = `${ROOT_URL}/api/v1/articles?offset=0&limit=20&is_matrix=1&sort=matrix_at&include_total=false`;
				const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
					const response = await ofetch<{ list?: SSPAIArticle[] }>(apiUrl, {
						responseType: "json",
					});

					return await Promise.all(
						(response.list ?? []).map(async (article) => {
							const detail = await cache.tryGet(`sspai:article:${article.id}`, () =>
								fetchArticleDetail(article.id, undefined, ofetch),
							);

							return {
								author: [{ name: article.author?.nickname }],
								date: date((article.released_at ?? Date.now() / 1000) * 1000),
								description: buildDescription(detail),
								link: `${ROOT_URL}/post/${article.id}`,
								title: article.title,
							} satisfies DataItem;
						}),
					);
				});

				return {
					description: "Latest SSPAI Matrix community articles.",
					item,
					language: "zh-CN",
					link: `${ROOT_URL}/matrix`,
					title: "SSPAI Matrix",
				} satisfies Data;
			}),
	)
	.feed(
		{
			description: "Fetch articles by a SSPAI author.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Author",
		},
		(app) =>
			app.get(
				"/author/:id",
				async ({ cache, date, ofetch, params: { id } }) => {
					const numericId = /^\d+$/.test(id) ? id : undefined;
					let authorId = numericId;
					let authorSlug = id;
					let authorNickname = id;

					if (!numericId) {
						const userUrl = `${ROOT_URL}/api/v1/user/slug/info/get?slug=${id}`;
						const userResponse = await ofetch<{
							data?: { id?: number; nickname?: string; slug?: string };
							error?: number;
						}>(userUrl, {
							headers: { Referer: `${ROOT_URL}/u/${id}/posts` },
							responseType: "json",
						});

						if (userResponse.error !== 0 || !userResponse.data?.id) {
							throw new FeedNotFoundError(`SSPAI author not found: ${id}`);
						}

						authorId = String(userResponse.data.id);
						authorSlug = userResponse.data.slug ?? id;
						authorNickname = userResponse.data.nickname ?? id;
					}

					const apiUrl = `${ROOT_URL}/api/v1/articles?offset=0&limit=20&author_ids=${authorId}&include_total=false`;
					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const response = await ofetch<{ list?: SSPAIArticle[] }>(apiUrl, {
							responseType: "json",
						});

						if (!authorNickname && response.list?.[0]?.author?.nickname) {
							authorNickname = response.list[0].author.nickname;
							authorSlug = response.list[0].author.slug ?? authorSlug;
						}

						return await Promise.all(
							(response.list ?? []).map(async (article) => {
								const detail = await cache.tryGet(`sspai:article:${article.id}`, () =>
									fetchArticleDetail(article.id, undefined, ofetch),
								);

								return {
									author: [{ name: article.author?.nickname }],
									date: date((article.released_at ?? Date.now() / 1000) * 1000),
									description: buildDescription(detail),
									link: `${ROOT_URL}/post/${article.id}`,
									title: article.title,
								} satisfies DataItem;
							}),
						);
					});

					return {
						description: `Articles by SSPAI author ${authorNickname}.`,
						item,
						language: "zh-CN",
						link: `${ROOT_URL}/u/${authorSlug}/posts`,
						title: `${authorNickname} - SSPAI Author`,
					} satisfies Data;
				},
				{
					params: t.Object({
						id: t.String({ description: "Author slug or numeric id." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch articles from a SSPAI column.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Column",
		},
		(app) =>
			app.get(
				"/column/:id",
				async ({ cache, date, ofetch, params: { id } }) => {
					const link = `${ROOT_URL}/column/${id}`;
					const desApi = `${ROOT_URL}/api/v1/special_columns/${id}`;
					const columnResponse = await ofetch<{ intro?: string; title?: string }>(desApi, {
						headers: { Referer: link },
						responseType: "json",
					});

					const apiUrl = `${ROOT_URL}/api/v1/articles?offset=0&limit=10&special_column_ids=${id}&include_total=false`;
					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const response = await ofetch<{ list?: SSPAIArticle[] }>(apiUrl, {
							headers: { Referer: link },
							responseType: "json",
						});

						return await Promise.all(
							(response.list ?? []).map(async (article) => {
								const detail = await cache.tryGet(`sspai:article:${article.id}`, () =>
									fetchArticleDetail(article.id, undefined, ofetch),
								);

								return {
									author: [{ name: article.author?.nickname }],
									date: date((article.created_at ?? Date.now() / 1000) * 1000),
									description: buildDescription(detail),
									link: `${ROOT_URL}/post/${article.id}`,
									title: article.title,
								} satisfies DataItem;
							}),
						);
					});

					return {
						description: columnResponse.intro ?? `SSPAI column ${id}.`,
						item,
						language: "zh-CN",
						link,
						title: `${columnResponse.title ?? id} - SSPAI Column`,
					} satisfies Data;
				},
				{
					params: t.Object({
						id: t.String({ description: "Column id." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch latest paid series updates from SSPAI.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Series Update",
		},
		(app) =>
			app.get(
				"/series/:id",
				async ({ cache, date, ofetch, params: { id } }) => {
					const seriesInfo = await ofetch<{ data?: SSPAISeries }>(
						`${ROOT_URL}/api/v1/series/info/get?id=${id}&view=second`,
						{
							responseType: "json",
						},
					);
					const seriesData = (seriesInfo.data ?? {}) as SSPAISeries;

					const apiUrl = `${ROOT_URL}/api/v1/series/article/search/page/get?series_id=${id}&weight=0&sort=desc&title=&limit=20&offset=0`;
					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const response = await ofetch<{ data?: SSPAISeries[] }>(apiUrl, {
							responseType: "json",
						});

						return await Promise.all(
							(response.data ?? []).map(async (article) => {
								let description = "";

								if (article.probation) {
									const detail = await cache.tryGet(`sspai:article:${article.id}`, () =>
										fetchArticleDetail(article.id, undefined, ofetch),
									);
									description = detail.body ?? "";
								} else if (article.banner) {
									description = `<img src="https://cdn.sspai.com/${article.banner}">`;
								}

								return {
									author: [{ name: seriesData.author?.nickname }],
									date: date((article.created_at ?? Date.now() / 1000) * 1000),
									description,
									link: `${ROOT_URL}/post/${article.id}`,
									title: `${article.title_prefix ?? ""} - ${article.title}`,
								} satisfies DataItem;
							}),
						);
					});

					return {
						description: seriesData.description ?? `SSPAI paid series ${id}.`,
						item,
						language: "zh-CN",
						link: `${ROOT_URL}/series/${id}`,
						title: `${seriesData.title ?? id} - SSPAI Series`,
					} satisfies Data;
				},
				{
					params: t.Object({
						id: t.String({ description: "Paid series id." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch articles by tag keyword from SSPAI.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Tag",
		},
		(app) =>
			app.get(
				"/tag/:keyword",
				async ({ cache, date, ofetch, params: { keyword } }) => {
					const encodedKeyword = encodeURIComponent(decodeURIComponent(keyword));
					const apiUrl = `${ROOT_URL}/api/v1/articles?offset=0&limit=50&has_tag=1&tag=${encodedKeyword}&include_total=false`;
					const host = `${ROOT_URL}/tag/${encodedKeyword}`;

					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const response = await ofetch<{ list?: SSPAIArticle[] }>(apiUrl, {
							headers: { Referer: host },
							responseType: "json",
						});

						return await Promise.all(
							(response.list ?? []).map(async (article) => {
								const detail = await cache.tryGet(`sspai:article:${article.id}`, () =>
									fetchArticleDetail(article.id, undefined, ofetch),
								);

								return {
									author: [{ name: article.author?.nickname }],
									date: date((article.released_at ?? Date.now() / 1000) * 1000),
									description: buildDescription(detail),
									link: `${ROOT_URL}/post/${article.id}`,
									title: article.title,
								} satisfies DataItem;
							}),
						);
					});

					return {
						description: `SSPAI articles tagged #${keyword}.`,
						item,
						language: "zh-CN",
						link: host,
						title: `#${keyword} - SSPAI`,
					} satisfies Data;
				},
				{
					params: t.Object({
						keyword: t.String({ description: "Tag keyword." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch articles from a SSPAI topic.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Topic",
		},
		(app) =>
			app.get(
				"/topic/:id",
				async ({ cache, date, ofetch, params: { id } }) => {
					const apiUrl = `${ROOT_URL}/api/v1/articles?offset=0&limit=20&topic_id=${id}&sort=created_at&include_total=false`;

					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const response = await ofetch<{ list?: SSPAIArticle[] }>(apiUrl, {
							responseType: "json",
						});

						return await Promise.all(
							(response.list ?? []).map(async (article) => {
								const detail = await cache.tryGet(`sspai:article:${article.id}`, () =>
									fetchArticleDetail(article.id, undefined, ofetch),
								);

								return {
									author: [{ name: article.author?.nickname }],
									date: date((article.created_at ?? Date.now() / 1000) * 1000),
									description: buildDescription(detail),
									link: `${ROOT_URL}/post/${article.id}`,
									title: article.title,
								} satisfies DataItem;
							}),
						);
					});

					const topic = item?.[0]?.category?.[0]?.name ?? id;

					return {
						description: `SSPAI topic ${id} articles.`,
						item,
						language: "zh-CN",
						link: `${ROOT_URL}/topic/${id}`,
						title: `${topic} - SSPAI Topic`,
					} satisfies Data;
				},
				{
					params: t.Object({
						id: t.String({ description: "Topic id." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch new topic collections from SSPAI topic square.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Topics",
		},
		(app) =>
			app.get("/topics", async ({ cache, date, ofetch }) => {
				const apiUrl = `${ROOT_URL}/api/v1/topics?offset=0&limit=20&include_total=false`;
				const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
					const response = await ofetch<{ list?: SSPAITopic[] }>(apiUrl, { responseType: "json" });

					return (response.list ?? []).map(
						(topic) =>
							({
								author: [{ name: topic.author?.nickname }],
								date: date((topic.released_at ?? Date.now() / 1000) * 1000),
								description: `<br><img src="https://cdnfile.sspai.com/${topic.banner}" alt="Topic Cover" style="display: block; margin: 0 auto;"/>${topic.intro}<br>Subscribe to the topic: ${ROOT_URL}/topic/${topic.id}`,
								link: `${ROOT_URL}/topic/${topic.id}`,
								title: topic.title,
							}) satisfies DataItem,
					);
				});

				return {
					description: "New topic collections from SSPAI topic square.",
					item,
					language: "zh-CN",
					link: `${ROOT_URL}/topics`,
					title: "SSPAI Topic Square",
				} satisfies Data;
			}),
	)
	.feed(
		{
			description: "Fetch public bookmarks of a SSPAI user.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Bookmarks",
		},
		(app) =>
			app.get(
				"/bookmarks/:slug",
				async ({ cache, date, ofetch, params: { slug } }) => {
					const link = `${ROOT_URL}/u/${slug}/bookmark_posts`;
					const [articleList, userInfo] = await Promise.all([
						cache.tryGet<DataItem[]>(link, async () => {
							const listResponse = await ofetch<{ data?: SSPAIArticle[] }>(
								`${ROOT_URL}/api/v1/article/user/favorite/public/page/get?limit=10&offset=0&slug=${slug}&type=all`,
								{
									headers: { Referer: link },
									responseType: "json",
								},
							);

							return (listResponse.data ?? []).slice(0, 10).map(
								(article) =>
									({
										author: [{ name: article.author?.nickname ?? "" }],
										date: date((article.released_time ?? Date.now() / 1000) * 1000),
										description: article.summary,
										link: `${ROOT_URL}/post/${article.id}`,
										title: article.title,
									}) satisfies DataItem,
							);
						}),
						ofetch<{ data?: SSPAIAuthor & { nickname?: string } }>(
							`${ROOT_URL}/api/v1/user/slug/info/get?slug=${slug}`,
							{
								headers: { Referer: link },
								responseType: "json",
							},
						),
					]);

					const nickname = userInfo.data?.nickname ?? slug;

					return {
						description: `Public bookmarks of SSPAI user ${nickname}.`,
						item: articleList,
						language: "zh-CN",
						link,
						title: `${nickname} - SSPAI Bookmarks`,
					} satisfies Data;
				},
				{
					params: t.Object({
						slug: t.String({ description: "User slug." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch newly listed paid series from SSPAI.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "New Series",
		},
		(app) =>
			app.get("/series", async ({ cache, date, load, ofetch }) => {
				const apiUrl = `${ROOT_URL}/api/v1/series/tag/all/get`;
				const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
					const response = await ofetch<{ data?: { children?: SSPAISeries[] }[] }>(apiUrl, {
						responseType: "json",
					});

					const products = (response.data ?? []).flatMap((category) =>
						(category.children ?? []).filter((child) => child.sell_status).map((child) => child),
					);

					return (await Promise.all(
						products.map(async (product) => {
							const link = `${ROOT_URL}/series/${product.id}`;
							const res = await ofetch<{ data?: SSPAISeries }>(
								`${ROOT_URL}/api/v1/series/info/get?id=${product.id}&view=second`,
								{
									responseType: "json",
								},
							);
							const data = (res.data ?? {}) as SSPAISeries;
							const banner = data.banner_web
								? `<img src="https://cdn.sspai.com/${data.banner_web}" />`
								: "";
							const description = banner + (data.intro ?? "");
							const price = product.price ? product.price / 100 : 0;

							return {
								author: [{ name: product.author?.nickname ?? "" }],
								date: date(new Date()),
								description: load(description).html() ?? description,
								link,
								title: `￥${price} - ${product.title}`,
							} satisfies DataItem;
						}),
					)) as DataItem[];
				});

				return {
					description: "Newly listed paid series on SSPAI.",
					item,
					language: "zh-CN",
					link: `${ROOT_URL}/series`,
					title: "SSPAI New Paid Series",
				} satisfies Data;
			}),
	)
	.feed(
		{
			description: "Fetch activity updates of a SSPAI user.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Activity",
		},
		(app) =>
			app.get(
				"/activity/:slug",
				async ({ date, ofetch, params: { slug } }) => {
					const link = `${ROOT_URL}/u/${slug}/updates`;
					const [response, responseUser] = await Promise.all([
						ofetch<{ data?: SSPAIActivity[] }>(
							`${ROOT_URL}/api/v1/information/user/activity/page/get?limit=10&offset=0&slug=${slug}`,
							{
								headers: { Referer: link },
								responseType: "json",
							},
						),
						ofetch<{ data?: SSPAIAuthor & { nickname?: string } }>(
							`${ROOT_URL}/api/v1/user/slug/info/get?slug=${slug}`,
							{
								headers: { Referer: link },
								responseType: "json",
							},
						),
					]);

					const userNickname = responseUser.data?.nickname ?? slug;
					const data = response.data ?? [];

					const item = data.map((activity) => {
						const contentData = activity.data ?? {};
						let itemTitle = "";
						let itemDesc = "";
						let itemUrl = link;

						switch (activity.key) {
							case "follow_user": {
								const users =
									(contentData as unknown as { nickname?: string; slug?: string }[]) ?? [];
								const nicknames = users.map((u) => u.nickname ?? "");
								const slugs = users.map(
									(u) => `<a href="${ROOT_URL}/u/${u.slug ?? ""}/updates">${u.nickname ?? ""}</a>`,
								);
								itemTitle = `${activity.author?.nickname}${activity.action}：${nicknames.join("、")}`;
								itemDesc = `${activity.author?.nickname}${activity.action}：${slugs.join("、")}`;
								itemUrl = `${ROOT_URL}/u/${slug}/follow`;
								break;
							}
							case "like_article": {
								const article = contentData as { id?: number; summary?: string; title?: string };
								itemTitle = `${activity.author?.nickname}${activity.action}：${article.title}`;
								itemDesc = `Summary:<br>${article.summary}`;
								itemUrl = `${ROOT_URL}/post/${article.id}`;
								break;
							}
							case "comment_article": {
								const comment = contentData as {
									article_id?: number;
									article_title?: string;
									comment?: string;
								};
								itemTitle = `${activity.author?.nickname}${activity.action}：${comment.article_title}`;
								itemDesc = comment.comment ?? "";
								itemUrl = `${ROOT_URL}/post/${comment.article_id}`;
								break;
							}
							case "release_article": {
								const article = contentData as { id?: number; summary?: string; title?: string };
								itemTitle = `${activity.author?.nickname}${activity.action}：${article.title}`;
								itemDesc = article.summary ?? "";
								itemUrl = `${ROOT_URL}/post/${article.id}`;
								break;
							}
							case "chosen_comment": {
								const comment = contentData as { article_title?: string; comment?: string };
								itemTitle = `${activity.author?.nickname} selected comment on ${comment.article_title}`;
								itemDesc = comment.comment ?? "";
								break;
							}
							default: {
								itemTitle = `Unknown activity: ${activity.key}`;
								itemDesc = JSON.stringify(contentData);
							}
						}

						return {
							date: date((activity.created_at ?? Date.now() / 1000) * 1000),
							description: itemDesc,
							link: itemUrl,
							title: itemTitle,
						} satisfies DataItem;
					});

					return {
						description: `Activity updates of SSPAI user ${userNickname}.`,
						item,
						language: "zh-CN",
						link,
						title: `${userNickname} - SSPAI Activity`,
					} satisfies Data;
				},
				{
					params: t.Object({
						slug: t.String({ description: "User slug." }),
					}),
				},
			),
	);
