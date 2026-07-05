import type { Data, DataItem } from "@/types";
import { Source } from "@/utils";

type HuxiuMoment = {
	content?: string;
	id?: string | number;
	published_at?: string;
	title?: string;
};

export default new Source({
	description: "Moment feeds from Huxiu (虎嗅).",
	domain: "huxiu.com",
	slug: "huxiu",
	title: "Huxiu",
}).feed(
	{
		description: "Fetch Huxiu 24-hour moment items.",
		language: "zh-CN",
		maintainer: { name: "RSSBook" },
		title: "Moments",
	},
	(app) =>
		app.get("/moment", async ({ cache, date, ofetch }) => {
			const apiUrl = "https://api-article.huxiu.com/web-v3/moment/feed";
			const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
				const response = await ofetch<{
					data?: { moment_list?: { datalist?: HuxiuMoment[] } };
				}>(apiUrl, {
					body: new URLSearchParams({ platform: "www" }),
					method: "POST",
					responseType: "json",
				});
				return (response.data?.moment_list?.datalist ?? []).map(
					(moment) =>
						({
							date: date(moment.published_at ?? new Date().toISOString()),
							description: moment.content,
							link: moment.id
								? `https://www.huxiu.com/moment/${moment.id}.html`
								: "https://www.huxiu.com/moment",
							title: moment.title || moment.content?.slice(0, 80) || "Huxiu Moment",
						}) satisfies DataItem,
				);
			});

			return {
				description: "Huxiu 24-hour moments.",
				item,
				language: "zh-CN",
				link: "https://www.huxiu.com/moment",
				title: "Huxiu Moments",
			} satisfies Data;
		}),
);
