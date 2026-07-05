import type { Data } from "@/types";
import { Source, t } from "@/utils";
import { parse } from "@/utils/feeds";

export default new Source({
	description: "Medium publications and user feeds.",
	domain: "medium.com",
	slug: "medium",
	title: "Medium",
}).feed(
	{
		description: "Fetch a user's Medium feed from the official RSS endpoint.",
		language: "en",
		maintainer: { name: "RSSBook" },
		title: "User Feed",
	},
	(app) =>
		app.get(
			"/feed/:user",
			async ({ cache, ofetch, params: { user } }) => {
				const feedUrl = `https://medium.com/feed/@${user}`;

				return cache.tryGet<Data>(feedUrl, async () => {
					const xml = await ofetch(feedUrl, { responseType: "text" });
					return parse(xml);
				});
			},
			{
				params: t.Object({
					user: t.String({ description: "Medium username." }),
				}),
			},
		),
);
