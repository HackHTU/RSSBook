/**
 * Bun Entry
 */

import { Cache } from "@/utils";
import { RSSBookApp } from "./RSSBookApp";

export const app = RSSBookApp({
	cache: Cache.LRU_Cache,
	config: {},
	feeds: ["https://github.blog/feed/"],
	meta: {
		description: "A simple RSS feed aggregator and reader.",
		title: "RSSBook",
	},
});
export default app;
export { RSSBookApp, Cache };
