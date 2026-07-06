/**
 * Node.js entrypoint
 */

import { node } from "@elysiajs/node";
import { createRSSBookApp, logger } from "rssbook";

export const app = createRSSBookApp({
	adapter: node(),
});

export default app;

app.listen(Number(process.env.PORT ?? 8787), (server) => {
	const hostname = server.hostname ?? "localhost";

	logger.info(
		`RSSBook running at ${hostname}:${server.port}, You can visit ${hostname}:${server.port}/openapi to look up all routes.`,
	);
});
