import type { Data } from "@/types";
import { Source } from "@/utils";
import { parse } from "@/utils/feeds";

export default new Source({
	description: "Daily product launch feeds from Product Hunt.",
	domain: "producthunt.com",
	slug: "producthunt",
	title: "Product Hunt",
}).feed(
	{
		description: "Fetch Product Hunt launches from the public RSS feed.",
		language: "en",
		maintainer: { name: "RSSBook" },
		title: "Today",
	},
	(app) =>
		app.get("/today", async ({ cache, ofetch }) => {
			const feedUrl = "https://www.producthunt.com/feed";
			return await cache.tryGet<Data>(feedUrl, async () => {
				const xml = await ofetch(feedUrl, { responseType: "text" });
				return {
					...parse(xml),
					language: "en",
					link: "https://www.producthunt.com",
					title: "Product Hunt Today",
				} satisfies Data;
			});
		}),
);
