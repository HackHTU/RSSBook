import { createRSSBookApp } from "rssbook";

const app = createRSSBookApp({
	book: {
		config: {},
		feeds: ["https://github.blog/feed/"],
		meta: {
			description: "A simple RSS feed aggregator and reader.",
			title: "RSSBook",
		},
	},
	openapi: {
		enableFetchOnlineServer: true,
	},
});

export default {
	fetch: app.fetch,
};
