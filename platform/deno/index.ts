/**
 * Deno entrypoint
 */

import { createRSSBookApp } from "rssbook";
import { type DenoKV, DenoKVCache } from "./cache";

export { DenoKVCache } from "./cache";

type DenoRuntime = {
	env: {
		get: (key: string) => string | undefined;
	};
	openKv: () => Promise<DenoKV>;
	serve: (
		options: { port: number },
		handler: (request: Request) => Response | Promise<Response>,
	) => unknown;
};

declare const Deno: DenoRuntime;

export const app = createRSSBookApp({
	browser: false,
	cache: new DenoKVCache(() => Deno.openKv()),
});
export default app;

const port = Number(Deno.env.get("PORT") ?? 8787);

Deno.serve({ port }, app.fetch);
