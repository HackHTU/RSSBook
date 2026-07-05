import type { Data, DataItem } from "@/types";
import { Source } from "@/utils";

type ZhihuDailyStory = {
	ga_prefix?: string;
	hint?: string;
	id: number;
	images?: string[];
	title: string;
	url: string;
};

type ZhihuHotItem = {
	target?: {
		created?: number;
		excerpt?: string;
		id?: number;
		title?: string;
		url?: string;
	};
};

export default new Source({
	description: "Public news and hot-list feeds from Zhihu (知乎).",
	domain: "zhihu.com",
	slug: "zhihu",
	title: "Zhihu",
})
	.feed(
		{
			description: "Fetch latest Zhihu Daily stories.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Zhihu Daily",
			withImage: "If-Present",
		},
		(app) =>
			app.get("/daily", async ({ cache, date, ofetch }) => {
				const apiUrl = "https://news-at.zhihu.com/api/4/news/latest";
				const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
					const response = await ofetch<{ date?: string; stories?: ZhihuDailyStory[] }>(apiUrl, {
						responseType: "json",
					});
					return (response.stories ?? []).map(
						(story) =>
							({
								date: date(response.date ?? new Date().toISOString()),
								description: story.hint,
								image: story.images?.[0],
								link: story.url,
								title: story.title,
							}) satisfies DataItem,
					);
				});

				return {
					description: "Latest Zhihu Daily stories.",
					item,
					language: "zh-CN",
					link: "https://daily.zhihu.com/",
					title: "Zhihu Daily",
				} satisfies Data;
			}),
	)
	.feed(
		{
			description: "Fetch Zhihu hot-list items.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Hot List",
		},
		(app) =>
			app.get("/hot", async ({ cache, date, ofetch }) => {
				const apiUrl = "https://api.zhihu.com/topstory/hot-lists/total?limit=20&reverse_order=0";
				const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
					const response = await ofetch<{ data?: ZhihuHotItem[] }>(apiUrl, {
						responseType: "json",
					});
					return (response.data ?? []).map(
						(entry) =>
							({
								date: date((entry.target?.created ?? Date.now() / 1000) * 1000),
								description: entry.target?.excerpt,
								link: toQuestionURL(entry.target?.url, entry.target?.id),
								title: entry.target?.title ?? "Zhihu Hot Item",
							}) satisfies DataItem,
					);
				});

				return {
					description: "Zhihu hot-list items.",
					item,
					language: "zh-CN",
					link: "https://www.zhihu.com/hot",
					title: "Zhihu Hot List",
				} satisfies Data;
			}),
	);

function toQuestionURL(url?: string, id?: number) {
	const questionId = url?.split("/").pop() ?? id;
	return questionId ? `https://www.zhihu.com/question/${questionId}` : "https://www.zhihu.com/hot";
}
