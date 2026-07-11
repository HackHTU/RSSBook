/// <reference types="./worker-configuration.d.ts" />
/**
 * Cloudflare Workers entrypoint
 */

import { env } from "cloudflare:workers";
import type { BrowserWorker } from "@cloudflare/puppeteer";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { createRSSBookApp } from "rssbook";
import { CloudflareBrowser } from "./browser";
import { CloudflareKVCache } from "./cache";

export { CloudflareKVCache } from "./cache";

export const app = createRSSBookApp({
	adapter: CloudflareAdapter,
	browser: new CloudflareBrowser(env.BROWSER as unknown as BrowserWorker),
	cache: new CloudflareKVCache(env.RSSBookKV),
	openapi: {
		enableFetchOnlineServer: false,
	},
	static: false,
});

export default app.compile();
