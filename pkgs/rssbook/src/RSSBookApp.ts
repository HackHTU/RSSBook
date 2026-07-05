import { serverTiming } from "@elysiajs/server-timing";
import { Elysia, type ElysiaAdapter } from "elysia";
import { bookPlugin } from "@/books";
import {
	assetsPlugin,
	errorHandlerPlugin,
	initPlugin,
	loggerPlugin,
	openAPIPlugin,
	type RSSBookBookConfig,
} from "@/plugins";
import { routePlugin } from "@/routers";
import type { Cache } from "@/utils";

/**
 * Configuration options for creating an RSSBook application.
 */
export interface RSSBookAppConfig {
	adapter?: ElysiaAdapter;
	book?: RSSBookBookConfig;
	cache?: Cache;
	openapi?: {
		/** Enable the online fetch server for proxying requests */
		enableFetchOnlineServer?: boolean;
	};
	/** Enable the static file serving plugin */
	static?: boolean;
}

/**
 * Create RSSBook main app
 * @param init RSSBook initialization config
 * @return Elysia app instance
 */
export const createRSSBookApp = (init?: RSSBookAppConfig) => {
	return (
		new Elysia({
			adapter: init?.adapter,
			name: "RSSBook/App",
		})
			// error boundary plugin
			.use(errorHandlerPlugin)
			// server timing plugin
			.use(serverTiming())
			// request logging
			.use(loggerPlugin)
			// generate openapi doc
			.use(openAPIPlugin(init?.openapi?.enableFetchOnlineServer))

			// init RSSBook instance
			.use(initPlugin({ book: init?.book, cache: init?.cache }))
			// book plugin
			.use(bookPlugin)
			// sign routes plugin
			.use(routePlugin)
			// static assets plugin
			.use(assetsPlugin(init?.static))
	);
};
