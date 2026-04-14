/**
 * Deno entrypoint
 */

import { Cache } from "@/utils";
import { RSSBookApp } from "./RSSBookApp";

const app = RSSBookApp({
	cache: Cache.LRU_Cache,
	config: {},
	enableFetchOnlineServer: true,
	feeds: ["https://github.blog/feed/"],
	meta: {
		description: "A simple RSS feed aggregator and reader.",
		title: "RSSBook",
	},
});
// @ts-expect-error Deno serve
Deno.serve(app.fetch);
