/**
 * Bun Entry
 */

import { Cache, logger } from "@/utils";
import { RSSBookApp } from "./RSSBookApp";

export const app = RSSBookApp({
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

app.listen(Number(Bun.env.PORT ?? 3000), (server) => {
	logger.info(
		`📕 RSSBook running at ${server.hostname}:${server.port}, You can visit ${server.hostname}:${server.port}/openapi to look up all routes. ✨`,
	);
});
