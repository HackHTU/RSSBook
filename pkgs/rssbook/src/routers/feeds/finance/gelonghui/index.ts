import type { Data, DataItem } from "@/types";
import { Source } from "@/utils";

type GelonghuiLive = {
	content?: string;
	createTimestamp?: number;
	pictures?: string[];
	route?: string;
	source?: string | Array<string | { name?: string }> | { name?: string };
	title?: string;
};

export default new Source({
	description: "Market news feeds from Gelonghui (格隆汇).",
	domain: "gelonghui.com",
	slug: "gelonghui",
	title: "Gelonghui",
}).feed(
	{
		description: "Fetch real-time market updates from Gelonghui.",
		fulltext: true,
		language: "zh-CN",
		maintainer: { name: "RSSBook" },
		title: "Live Updates",
		withImage: "If-Present",
	},
	(app) =>
		app.get("/live", async ({ cache, date, ofetch }) => {
			const apiUrl = "https://www.gelonghui.com/api/live-channels/all/lives/v4";
			const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
				const response = await ofetch<{ result?: GelonghuiLive[] }>(apiUrl, {
					responseType: "json",
				});
				return (response.result ?? []).map((entry) => {
					const rawSources = Array.isArray(entry.source)
						? entry.source
						: entry.source
							? [entry.source]
							: undefined;
					const sources = rawSources
						?.map((source) => (typeof source === "string" ? source : source.name))
						.filter((source): source is string => !!source);
					return {
						category: sources?.map((name) => ({ name })),
						date: date((entry.createTimestamp ?? Date.now() / 1000) * 1000),
						description: entry.content,
						image: entry.pictures?.[0],
						link: entry.route ?? "https://www.gelonghui.com/live",
						title: entry.title || entry.content || "Gelonghui Live Update",
					} satisfies DataItem;
				});
			});

			return {
				description: "Real-time market updates from Gelonghui.",
				item,
				language: "zh-CN",
				link: "https://www.gelonghui.com/live",
				title: "Gelonghui Live Updates",
			} satisfies Data;
		}),
);
