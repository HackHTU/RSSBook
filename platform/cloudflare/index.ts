/// <reference types="./worker-configuration.d.ts" />
/**
 * Cloudflare Workers entrypoint
 */

import { env } from "cloudflare:workers";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { RSSBookApp } from "rssbook";
import { Cache } from "rssbook/utils";

export const app = RSSBookApp({
	adapter: CloudflareAdapter,
	cache: Cache.CLOUDFLARE_KV_Cache(env.RSSBookKV),
	config: {},
	enableFetchOnlineServer: false,
	feeds: ["https://github.blog/feed/"],
	meta: {
		description: "A simple RSS feed aggregator and reader.",
		title: "RSSBook",
	},
	staticPlugin: false,
});

export default app.compile();
