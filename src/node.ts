/**
 * Node.js Compatible Entry
 */

import { node } from "@elysiajs/node";
import { Elysia } from "elysia";
import { assetsPlugin } from "@/plugins";
import { Cache, logger } from "@/utils";
import { RSSBookApp } from "./app";

new Elysia({
	adapter: node(),
})
	.use(
		RSSBookApp({
			cache: Cache.LRU_Cache,
			config: {},
			enableFetchOnlineServer: true,
			feeds: ["https://github.blog/feed/"],
			meta: {
				description: "A simple RSS feed aggregator and reader.",
				title: "RSSBook",
			},
		}),
	)
	.use(assetsPlugin())
	.listen(process.env.PORT ?? 8787, (app) => {
		logger.info(
			`📕 RSSBook running at ${app?.hostname}:${app?.port}, You can visit ${app?.hostname}:${app?.port}/openapi to look up all routes. ✨`,
		);
	});
