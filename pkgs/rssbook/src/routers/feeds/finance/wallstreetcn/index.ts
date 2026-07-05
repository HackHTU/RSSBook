import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

type WSCNLiveItem = {
	author?: { display_name?: string };
	content?: string;
	content_text?: string;
	display_time?: number;
	images?: Array<{ uri?: string }>;
	title?: string;
	uri?: string;
};

export default new Source({
	description: "Market news feeds from Wallstreetcn (华尔街见闻).",
	domain: "wallstreetcn.com",
	slug: "wallstreetcn",
	title: "Wallstreetcn",
}).feed(
	{
		description: "Fetch live market updates from a Wallstreetcn channel.",
		fulltext: true,
		language: "zh-CN",
		maintainer: { name: "RSSBook" },
		title: "Live Updates",
		withImage: "If-Present",
	},
	(app) =>
		app.get(
			"/live/:category",
			async ({ cache, date, ofetch, params: { category } }) => {
				const apiUrl = `https://api-one.wallstcn.com/apiv1/content/lives?channel=${category}-channel&limit=50`;
				const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
					const response = await ofetch<{ data?: { items?: WSCNLiveItem[] } }>(apiUrl, {
						responseType: "json",
					});
					return (response.data?.items ?? []).map(
						(entry) =>
							({
								author: [{ name: entry.author?.display_name }],
								date: date((entry.display_time ?? Date.now() / 1000) * 1000),
								description: entry.content ?? entry.content_text,
								image: entry.images?.[0]?.uri,
								link: entry.uri ?? `https://wallstreetcn.com/live/${category}`,
								title: entry.title || entry.content_text || "Wallstreetcn Live Update",
							}) satisfies DataItem,
					);
				});

				return {
					description: `Wallstreetcn live updates for ${category}.`,
					item,
					language: "zh-CN",
					link: `https://wallstreetcn.com/live/${category}`,
					title: `Wallstreetcn Live - ${category}`,
				} satisfies Data;
			},
			{
				params: t.Object({
					category: t.String({
						default: "global",
						description: "Live channel, for example global, shares, or forex.",
					}),
				}),
			},
		),
);
