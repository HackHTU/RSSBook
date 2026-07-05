import type { Data } from "@/types";
import { Source, t } from "@/utils";
import { parse } from "@/utils/feeds";

export default new Source({
	description: "HTML feeds from Reuters.",
	domain: "reuters.com",
	slug: "reuters",
	title: "Reuters",
}).feed(
	{
		description: "Fetch article cards from a Reuters section page.",
		language: "en",
		maintainer: { name: "RSSBook" },
		title: "Section Articles",
	},
	(app) =>
		app.get(
			"/:section",
			async ({ cache, ofetch, params: { section } }) => {
				const link = `https://www.reuters.com/${section}/`;
				const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(`site:reuters.com/${section} Reuters`)}&hl=en-US&gl=US&ceid=US:en`;
				const data = await cache.tryGet<Data>(feedUrl, async () => {
					const xml = await ofetch(feedUrl, { responseType: "text" });
					return parse(xml) satisfies Data;
				});

				return {
					description: `Reuters ${section} articles.`,
					item: data.item,
					language: "en",
					link,
					title: `Reuters - ${section}`,
				} satisfies Data;
			},
			{
				params: t.Object({
					section: t.String({
						default: "world",
						description: "Reuters section path, for example world or business.",
					}),
				}),
			},
		),
);
