import type { Data, DataItem } from "@/types";
import { Source } from "@/utils";

type CLSRollItem = {
	content?: string;
	ctime?: number;
	images?: string[];
	shareurl?: string;
	title?: string;
};

export default new Source({
	description: "Financial news feeds from CLS (财联社).",
	domain: "cls.cn",
	slug: "cls",
	title: "CLS",
}).feed(
	{
		description: "Fetch CLS telegraph updates from the public cache API.",
		fulltext: true,
		language: "zh-CN",
		maintainer: { name: "RSSBook" },
		title: "Telegraph",
		withImage: "If-Present",
	},
	(app) =>
		app.get("/telegraph", async ({ cache, date, ofetch }) => {
			const apiUrl =
				"https://www.cls.cn/api/cache?appName=CailianpressWeb&os=web&sv=8.7.9&name=telegraph";
			const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
				const response = await ofetch<{ data?: { roll_data?: CLSRollItem[] } }>(apiUrl, {
					responseType: "json",
				});
				return (response.data?.roll_data ?? []).map(
					(entry) =>
						({
							date: date((entry.ctime ?? Date.now() / 1000) * 1000),
							description: entry.content,
							image: entry.images?.[0],
							link: entry.shareurl ?? "https://www.cls.cn/telegraph",
							title: entry.title || entry.content || "CLS Telegraph",
						}) satisfies DataItem,
				);
			});

			return {
				description: "CLS telegraph updates.",
				item,
				language: "zh-CN",
				link: "https://www.cls.cn/telegraph",
				title: "CLS Telegraph",
			} satisfies Data;
		}),
);
