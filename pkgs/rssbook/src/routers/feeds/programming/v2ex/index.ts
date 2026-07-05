import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

type V2EXTopic = {
	content?: string;
	content_rendered?: string;
	created?: number;
	id: number;
	member?: { username?: string };
	title: string;
	url: string;
};

export default new Source({
	description: "Public topic feeds from V2EX (中国程序员社区).",
	domain: "www.v2ex.com",
	slug: "v2ex",
	title: "V2EX",
})
	.feed(
		{
			description: "Fetch latest, hot, or recent V2EX topics.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Topics",
		},
		(app) =>
			app.get(
				"/topics/:type",
				async ({ cache, date, ofetch, params: { type } }) => {
					const apiUrl = `https://www.v2ex.com/api/topics/${type}.json`;
					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const topics = await ofetch<V2EXTopic[]>(apiUrl, { responseType: "json" });
						return topics.map(
							(topic) =>
								({
									author: [{ name: topic.member?.username }],
									date: date((topic.created ?? Date.now() / 1000) * 1000),
									description: topic.content,
									link: topic.url,
									title: topic.title,
								}) satisfies DataItem,
						);
					});

					return {
						description: `V2EX ${type} topics.`,
						item,
						language: "zh-CN",
						link: `https://www.v2ex.com/?tab=${type}`,
						title: `V2EX Topics - ${type}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						type: t.String({ description: "Topic type, for example latest or hot." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch a V2EX topic and its replies.",
			fulltext: true,
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Post Replies",
		},
		(app) =>
			app.get(
				"/post/:postid",
				async ({ cache, date, ofetch, params: { postid } }) => {
					const topicUrl = `https://www.v2ex.com/api/topics/show.json?id=${postid}`;
					const repliesUrl = `https://www.v2ex.com/api/replies/show.json?topic_id=${postid}`;
					const data = await cache.tryGet<Data>(`v2ex:${postid}`, async () => {
						const [topics, replies] = await Promise.all([
							ofetch<V2EXTopic[]>(topicUrl, { responseType: "json" }),
							ofetch<
								Array<{
									content_rendered?: string;
									created?: number;
									member?: { username?: string };
								}>
							>(repliesUrl, { responseType: "json" }),
						]);
						const topic = topics[0];
						return {
							description: topic?.content,
							item: replies.map(
								(reply) =>
									({
										author: [{ name: reply.member?.username }],
										date: date((reply.created ?? Date.now() / 1000) * 1000),
										description: reply.content_rendered,
										link: topic?.url ?? `https://www.v2ex.com/t/${postid}`,
										title: `${topic?.title ?? `V2EX ${postid}`} - ${reply.member?.username ?? "reply"}`,
									}) satisfies DataItem,
							),
							language: "zh-CN",
							link: topic?.url ?? `https://www.v2ex.com/t/${postid}`,
							title: `V2EX Post - ${topic?.title ?? postid}`,
						} satisfies Data;
					});

					return data satisfies Data;
				},
				{
					params: t.Object({
						postid: t.String({ description: "V2EX topic ID." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch the V2EX XNA aggregated blog feed.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "XNA",
		},
		(app) =>
			app.get("/xna", async ({ cache, date, load, ofetch }) => {
				const pageUrl = "https://v2ex.com/xna";
				const item = await cache.tryGet<DataItem[]>(pageUrl, async () => {
					const html = await ofetch(pageUrl, { responseType: "text" });
					const $ = load(html);

					const items = $("div.xna-entry-main-container")
						.toArray()
						.map((el) => {
							const $el = $(el);
							const $link = $el.find(".xna-entry-title a").first();
							const author = $el.find(".xna-source-author a").first().text().trim();
							const dateText = $el.find(".xna-entry-date").first().text().trim();
							const rawLink = $link.attr("href") || "";
							let link = rawLink;
							if (rawLink) {
								try {
									link = new URL(rawLink).href;
								} catch {
									// keep original link if URL normalization fails
								}
							}

							return {
								author: author ? [{ name: author }] : undefined,
								date: dateText ? date(dateText) : new Date(),
								description: $link.text().trim(),
								link: link || pageUrl,
								title: $link.text().trim(),
							} satisfies DataItem;
						});

					return items;
				});

				return {
					description: "V2EX XNA aggregated blog feed.",
					item,
					language: "zh-CN",
					link: pageUrl,
					title: "V2EX XNA",
				} satisfies Data;
			}),
	)
	.feed(
		{
			description: "Fetch topics from a V2EX tab.",
			fulltext: true,
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Tab",
		},
		(app) =>
			app.get(
				"/tab/:tabid",
				async ({ cache, formatHTML, load, ofetch, params: { tabid } }) => {
					const pageUrl = `https://v2ex.com/?tab=${tabid}`;
					const data = await cache.tryGet<Data>(pageUrl, async () => {
						const html = await ofetch(pageUrl, { responseType: "text" });
						const $ = load(html);
						const links = $("span.item_title a")
							.toArray()
							.slice(0, 10)
							.map((el) => {
								const href = $(el).attr("href") || "";
								return `https://www.v2ex.com${href.replace(/#.*$/, "")}`;
							});

						const item = await Promise.all(
							links.map(async (link) =>
								cache.tryGet<DataItem>(`v2ex:tab:${link}`, async () => {
									try {
										const topicHtml = await ofetch(link, { responseType: "text" });
										const $$ = load(topicHtml);
										const title = $$(".header h1").first().text().trim();
										const author = $$("div.header > small > a").first().text().trim();
										const topicContent = $$("div.topic_content").first().html();

										const replies = $$('[id^="r_"]')
											.toArray()
											.map((replyEl) => {
												const $reply = $$(replyEl);
												const no = $reply.find(".no").first().text().trim();
												const replyAuthor = $reply.find(".dark").first().text().trim();
												const content = $reply.find(".reply_content").html();
												return `<p><div>#${no}: <i>${replyAuthor}</i></div><div>${content}</div></p>`;
											})
											.join("");

										return {
											author: author ? [{ name: author }] : undefined,
											date: new Date(),
											description: formatHTML(`${topicContent ?? ""}<div>${replies}</div>`, link),
											link,
											title: title || link,
										} satisfies DataItem;
									} catch {
										return {
											date: new Date(),
											link,
											title: link,
										} satisfies DataItem;
									}
								}),
							),
						);

						return {
							description: `V2EX ${tabid} tab topics.`,
							item,
							language: "zh-CN",
							link: pageUrl,
							title: `V2EX Tab - ${tabid}`,
						} satisfies Data;
					});

					return data satisfies Data;
				},
				{
					params: t.Object({
						tabid: t.String({ description: "Tab ID, for example hot or tech." }),
					}),
				},
			),
	);
