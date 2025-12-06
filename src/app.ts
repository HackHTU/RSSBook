import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { bookPlugin } from "@/books";
import {
	errorHandlerPlugin,
	initPlugin,
	loggerPlugin,
	openAPIPlugin,
	type RSSBookInitConfig,
} from "@/plugins";
import { routePlugin } from "@/routers";

type RSSBookAppConfig = RSSBookInitConfig & {
	enableFetchOnlineServer?: boolean;
};

/**
 * RSSBook Main App
 * @param init RSSBook initialization config
 * @return Elysia app instance
 */
export const RSSBookApp = (init?: RSSBookAppConfig) =>
	new Elysia({ name: "RSSBook/App" })
		// error boundary plugin
		.use(errorHandlerPlugin)
		// server timing plugin
		.use(serverTiming())
		// request logging
		.use(loggerPlugin)
		// generate openapi doc
		.use(openAPIPlugin())

		// init RSSBook instance
		.use(initPlugin(init))

		// book plugin
		.use(bookPlugin)
		// sign routes plugin
		.use(routePlugin);
