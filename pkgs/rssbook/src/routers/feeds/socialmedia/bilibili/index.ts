import type { Data, DataItem } from "@/types";
import { Source } from "@/utils";

type BilibiliVideo = {
	bvid?: string;
	cover?: string;
	desc?: string;
	owner?: { name?: string };
	pic?: string;
	pubdate?: number;
	url?: string;
	title?: string;
};

export default new Source({
	description: "Public video feeds from Bilibili (哔哩哔哩).",
	domain: "bilibili.com",
	slug: "bilibili",
	title: "Bilibili",
})
	.feed(
		{
			description: "Fetch popular Bilibili videos.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Popular Videos",
			withImage: "If-Present",
		},
		(app) =>
			app.get("/popular", async ({ cache, date, ofetch }) => {
				const apiUrl = "https://api.bilibili.com/x/web-interface/popular?ps=20&pn=1";
				const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
					const response = await ofetch<{ data?: { list?: BilibiliVideo[] } }>(apiUrl, {
						responseType: "json",
					});
					return (response.data?.list ?? []).map((video) => toItem(video, date));
				});

				return {
					description: "Popular Bilibili videos.",
					item,
					language: "zh-CN",
					link: "https://www.bilibili.com/v/popular/all",
					title: "Bilibili Popular Videos",
				} satisfies Data;
			}),
	)
	.feed(
		{
			description: "Fetch Bilibili ranking videos.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Ranking Videos",
			withImage: "If-Present",
		},
		(app) =>
			app.get("/ranking", async ({ cache, date, ofetch }) => {
				const apiUrl =
					"https://api.bilibili.com/pgc/web/rank/list?day=3&season_type=1&web_location=333.934";
				const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
					const response = await ofetch<{ result?: { list?: BilibiliVideo[] } }>(apiUrl, {
						headers: {
							Referer: "https://www.bilibili.com/v/popular/rank/anime",
						},
						responseType: "json",
					});
					return (response.result?.list ?? []).map((video) => toItem(video, date));
				});

				return {
					description: "Bilibili ranking videos.",
					item,
					language: "zh-CN",
					link: "https://www.bilibili.com/v/popular/rank/anime",
					title: "Bilibili Ranking",
				} satisfies Data;
			}),
	);

function toItem(video: BilibiliVideo, parseDate: (value: number) => Date): DataItem {
	return {
		author: [{ name: video.owner?.name }],
		date: parseDate((video.pubdate ?? Date.now() / 1000) * 1000),
		description: video.desc,
		image: video.pic ?? video.cover,
		link:
			video.url ??
			(video.bvid ? `https://www.bilibili.com/video/${video.bvid}` : "https://www.bilibili.com"),
		title: video.title ?? "Bilibili Video",
	} satisfies DataItem;
}
