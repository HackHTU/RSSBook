import { assetsPlugin } from "@/plugins";
import { Cache } from "@/utils";
import { RSSBookApp } from "./app";

export default RSSBookApp({
	cache: Cache.LRU_Cache,
	config: {},
	enableFetchOnlineServer: true,
	feeds: ["https://github.blog/feed/"],
	meta: {
		description: "A simple RSS feed aggregator and reader.",
		title: "RSSBook",
	},
}).use(assetsPlugin());
