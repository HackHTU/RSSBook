/**
 * Node.js Compatible Entry
 */

import { node } from "@elysiajs/node";
import { Cache, logger } from "@/utils";
import { RSSBookApp } from "./RSSBookApp";

RSSBookApp({
	adapter: node(),
	cache: Cache.LRU_Cache,
	config: {},
	enableFetchOnlineServer: true,
	feeds: ["https://github.blog/feed/"],
	meta: {
		description: "A simple RSS feed aggregator and reader.",
		title: "RSSBook",
	},
}).listen(process.env.PORT ?? 8787, (app) => {
	logger.info(
		`📕 RSSBook running at ${app?.hostname}:${app?.port}, You can visit ${app?.hostname}:${app?.port}/openapi to look up all routes. ✨`,
	);
});
