/**
 * Node.js entrypoint
 */

import { node } from "@elysiajs/node";
import { RSSBookApp } from "rssbook";
import { Cache, logger } from "rssbook/utils";

export const app = RSSBookApp({
	adapter: node(),
	cache: Cache.LRU_Cache,
	config: {},
	enableFetchOnlineServer: true,
	feeds: ["https://github.blog/feed/"],
	meta: {
		description: "A simple RSS feed aggregator and reader.",
		title: "RSSBook",
	},
});

export default app;

app.listen(Number(process.env.PORT ?? 8787), (server) => {
	logger.info(
		`📕 RSSBook running at ${server?.hostname}:${server?.port}, You can visit ${server?.hostname}:${server?.port}/openapi to look up all routes. ✨`,
	);
});
