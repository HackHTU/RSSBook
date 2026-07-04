/**
 * Deno entrypoint
 */

import { RSSBookApp } from "rssbook";
import { Cache, logger } from "rssbook/utils";

type DenoRuntime = {
	env: {
		get: (key: string) => string | undefined;
	};
	serve: (
		options: { port: number },
		handler: (request: Request) => Response | Promise<Response>,
	) => unknown;
};

declare const Deno: DenoRuntime;

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

const port = Number(Deno.env.get("PORT") ?? 8787);

Deno.serve({ port }, app.fetch);

logger.info(
	`📕 RSSBook running at 0.0.0.0:${port}, You can visit http://localhost:${port}/openapi to look up all routes. ✨`,
);
