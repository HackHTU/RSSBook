import type { Data } from "@/types";
import { Source, t } from "@/utils";
import { parse } from "@/utils/feeds";

const CHANNELS: Record<string, string> = {
	home: "https://feeds.bbci.co.uk/news/rss.xml",
	technology: "https://feeds.bbci.co.uk/news/technology/rss.xml",
	world: "https://feeds.bbci.co.uk/news/world/rss.xml",
};

export default new Source({
	description: "RSS feeds from BBC News.",
	domain: "bbc.com",
	slug: "bbc",
	title: "BBC",
}).feed(
	{
		description: "Fetch a BBC News RSS channel.",
		language: "en",
		maintainer: { name: "RSSBook" },
		title: "News Channel",
	},
	(app) =>
		app.get(
			"/news/:channel",
			async ({ cache, ofetch, params: { channel } }) => {
				const feedUrl = CHANNELS[channel] ?? CHANNELS.home;
				return await cache.tryGet<Data>(feedUrl, async () => {
					const xml = await ofetch(feedUrl, { responseType: "text" });
					return {
						...parse(xml),
						link: `https://www.bbc.com/news${channel === "home" ? "" : `/${channel}`}`,
						title: `BBC News - ${channel}`,
					} satisfies Data;
				});
			},
			{
				params: t.Object({
					channel: t.String({
						default: "home",
						description: "BBC channel, for example home, world, or technology.",
					}),
				}),
			},
		),
);
