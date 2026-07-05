import type { Data, DataItem } from "@/types";
import { Source } from "@/utils";

export default new Source({
	description: "News feeds from 36Kr (36氪).",
	domain: "36kr.com",
	slug: "kr36",
	title: "36Kr",
}).feed(
	{
		description: "Fetch article links from the 36Kr news page.",
		language: "zh-CN",
		maintainer: { name: "RSSBook" },
		title: "News",
	},
	(app) =>
		app.get("/news", async ({ cache, date, load, ofetch, toAbsoluteURL }) => {
			const link = "https://36kr.com/newsflashes";
			const item = await cache.tryGet<DataItem[]>(link, async () => {
				const html = await ofetch(link, { responseType: "text" });
				const $ = load(html);
				const seen = new Set<string>();
				return $("a[href*='/p/']")
					.toArray()
					.map((anchor) => {
						const element = $(anchor);
						return {
							date: date(new Date()),
							link: toAbsoluteURL(element.attr("href") ?? "", link),
							title: element.text().trim().replaceAll(/\s+/g, " "),
						} satisfies DataItem;
					})
					.filter((entry) => {
						if (!entry.title || seen.has(entry.link)) return false;
						seen.add(entry.link);
						return true;
					})
					.slice(0, 20);
			});

			return {
				description: "Latest 36Kr news links.",
				item,
				language: "zh-CN",
				link,
				title: "36Kr News",
			} satisfies Data;
		}),
);
