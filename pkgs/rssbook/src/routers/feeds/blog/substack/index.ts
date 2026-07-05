import type { Data } from "@/types";
import { Source, t } from "@/utils";
import { parse } from "@/utils/feeds";

export default new Source({
	description: "Substack newsletters and publications.",
	domain: "substack.com",
	slug: "substack",
	title: "Substack",
}).feed(
	{
		description: "Fetch a Substack publication's RSS feed.",
		language: "en",
		maintainer: { name: "RSSBook" },
		title: "Newsletter",
	},
	(app) =>
		app.get(
			"/subscribe/:user",
			async ({ cache, ofetch, params: { user } }) => {
				const feedUrl = `https://${user}.substack.com/feed`;

				return cache.tryGet<Data>(feedUrl, async () => {
					const xml = await ofetch(feedUrl, { responseType: "text" });
					return parse(xml);
				});
			},
			{
				params: t.Object({
					user: t.String({ description: "Substack publication username." }),
				}),
			},
		),
);
