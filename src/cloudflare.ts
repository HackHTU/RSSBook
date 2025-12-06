/// <reference types="../worker-configuration.d.ts" />
/**
 * Cloudflare Workers Entry
 */

import { env } from "cloudflare:workers";
import { Elysia } from "elysia";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { RSSBookApp } from "./app";
import { Cache } from "./utils";

export default new Elysia({
	adapter: CloudflareAdapter,
	name: "RSSBook/CloudflareWorker",
})
	.use(
		// RSSBookApp Configuration
		RSSBookApp({
			cache: Cache.CLOUDFLARE_KV_Cache(env.RSSBookKV),
			config: {},
			enableFetchOnlineServer: false, // online server is not supported in Cloudflare Workers
			feeds: ["https://github.blog/feed/"],
			meta: {
				description: "A simple RSS feed aggregator and reader.",
				title: "RSSBook",
			},
		}),
	)
	.compile();
