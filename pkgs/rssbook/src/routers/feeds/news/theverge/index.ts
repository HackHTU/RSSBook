import type { Data } from "@/types";
import { Source } from "@/utils";
import { parse } from "@/utils/feeds";

export default new Source({
	description: "RSS feeds from The Verge.",
	domain: "theverge.com",
	slug: "theverge",
	title: "The Verge",
}).feed(
	{
		description: "Fetch The Verge front page RSS feed.",
		language: "en",
		maintainer: { name: "RSSBook" },
		title: "Front Page",
	},
	(app) =>
		app.get("/", async ({ cache, ofetch }) => {
			const feedUrl = "https://www.theverge.com/rss/index.xml";
			return await cache.tryGet<Data>(feedUrl, async () => {
				const xml = await ofetch(feedUrl, { responseType: "text" });
				return {
					...parse(xml),
					language: "en",
					link: "https://www.theverge.com",
					title: "The Verge",
				} satisfies Data;
			});
		}),
);
