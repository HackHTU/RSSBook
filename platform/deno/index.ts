/**
 * Deno entrypoint
 */

import { Cache, createRSSBookApp } from "rssbook";
import { createStorage } from "unstorage";
import denoKvDriver from "unstorage/drivers/deno-kv";

type DenoRuntime = {
	env: {
		get: (key: string) => string | undefined;
	};
	openKv: () => Promise<DenoKv>;
	serve: (
		options: { port: number },
		handler: (request: Request) => Response | Promise<Response>,
	) => unknown;
};

type DenoKv = {
	close: () => void;
};

declare const Deno: DenoRuntime;

const storage = createStorage({
	driver: denoKvDriver({
		base: "rssbook:",
		openKv: () => Deno.openKv(),
	}),
});

export const app = createRSSBookApp({
	book: {
		config: {},
		feeds: ["https://github.blog/feed/"],
		meta: {
			description: "A simple RSS feed aggregator and reader.",
			title: "RSSBook",
		},
	},
	cache: new Cache(storage),
	openapi: {
		enableFetchOnlineServer: true,
	},
});
export default app;

const port = Number(Deno.env.get("PORT") ?? 8787);

Deno.serve({ port }, app.fetch);
