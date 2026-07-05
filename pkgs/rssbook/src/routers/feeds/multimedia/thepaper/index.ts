import type { Data, DataItem } from "@/types";
import { Source } from "@/utils";

type ThePaperItem = {
	contId?: string | number;
	name?: string;
	pubTime?: string;
	title?: string;
};

export default new Source({
	description: "Front-page news feeds from The Paper (澎湃新闻).",
	domain: "thepaper.cn",
	slug: "thepaper",
	title: "The Paper",
}).feed(
	{
		description: "Fetch front-page featured articles from The Paper mobile site.",
		language: "zh-CN",
		maintainer: { name: "RSSBook" },
		title: "Featured Articles",
	},
	(app) =>
		app.get("/featured", async ({ cache, date, load, ofetch }) => {
			const link = "https://m.thepaper.cn";
			const item = await cache.tryGet<DataItem[]>(link, async () => {
				const html = await ofetch(link, { responseType: "text" });
				const $ = load(html);
				const raw = $("#__NEXT_DATA__").text();
				const parsed = JSON.parse(raw) as {
					props?: {
						pageProps?: {
							data?: { list?: ThePaperItem[] };
							topData?: { recommendImg?: ThePaperItem[] };
						};
					};
				};
				const list = [
					...(parsed.props?.pageProps?.data?.list ?? []),
					...(parsed.props?.pageProps?.topData?.recommendImg ?? []),
				];
				return list
					.map(
						(entry) =>
							({
								date: date(entry.pubTime ?? new Date().toISOString()),
								link: entry.contId ? `https://m.thepaper.cn/detail/${entry.contId}` : link,
								title: entry.title || entry.name || "The Paper Article",
							}) satisfies DataItem,
					)
					.slice(0, 20);
			});

			return {
				description: "Featured articles from The Paper.",
				item,
				language: "zh-CN",
				link,
				title: "The Paper Featured Articles",
			} satisfies Data;
		}),
);
