import { serverTiming } from "@elysiajs/server-timing";
import { Elysia, type ElysiaAdapter } from "elysia";
import { bookPlugin } from "@/books";
import {
	assetsPlugin,
	errorHandlerPlugin,
	initPlugin,
	loggerPlugin,
	openAPIPlugin,
	type RSSBookInitConfig,
} from "@/plugins";
import { routePlugin } from "@/routers";

type RSSBookAppConfig = RSSBookInitConfig & {
	enableFetchOnlineServer?: boolean;
	staticPlugin?: boolean;

	adapter?: ElysiaAdapter;
};

/**
 * RSSBook Main App
 * @param init RSSBook initialization config
 * @return Elysia app instance
 */
export const RSSBookApp = (init?: RSSBookAppConfig) => {
	if (init) {
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
				.use(openAPIPlugin(init?.enableFetchOnlineServer))

				// init RSSBook instance
				.use(initPlugin(init))
				// book plugin
				.use(bookPlugin)
				// sign routes plugin
				.use(routePlugin)
				// static assets plugin
				.use(assetsPlugin(init?.staticPlugin))
		);
	} else {
		return new Elysia({
			name: "RSSBook/App",
		});
	}
};
