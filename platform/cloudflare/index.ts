/// <reference types="./worker-configuration.d.ts" />
/**
 * Cloudflare Workers entrypoint
 */

import { env } from "cloudflare:workers";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { Cache, createRSSBookApp } from "rssbook";
import { createStorage } from "unstorage";
import cloudflareKVBindingDriver from "unstorage/drivers/cloudflare-kv-binding";

export const app = createRSSBookApp({
	adapter: CloudflareAdapter,
	browser: false,
	cache: new Cache(
		createStorage({
			driver: cloudflareKVBindingDriver({
				binding: env.RSSBookKV,
			}),
		}),
	),
	openapi: {
		enableFetchOnlineServer: false,
	},
	static: false,
});

export default app.compile();
