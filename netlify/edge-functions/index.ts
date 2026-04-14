/**
 * Netlify Edge Functions entrypoint
 */

import { RSSBookApp } from "../../src/RSSBookApp";
import { Cache } from "../../src/utils/index";

export const config = { path: "/*" };

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

export default app.fetch;
