import type { Data } from "@/types";
import { Source } from "@/utils";
import { parse } from "@/utils/feeds";

export default new Source({
	description: "RSS feeds from Solidot.",
	domain: "solidot.org",
	slug: "solidot",
	title: "Solidot",
}).feed(
	{
		description: "Fetch the latest Solidot stories.",
		language: "zh-CN",
		maintainer: { name: "RSSBook" },
		title: "Latest Stories",
	},
	(app) =>
		app.get("/", async ({ cache, ofetch }) => {
			const feedUrl = "https://www.solidot.org/index.rss";
			return await cache.tryGet<Data>(feedUrl, async () => {
				const xml = await ofetch(feedUrl, { responseType: "text" });
				return {
					...parse(xml),
					language: "zh-CN",
					link: "https://www.solidot.org",
					title: "Solidot",
				} satisfies Data;
			});
		}),
);
