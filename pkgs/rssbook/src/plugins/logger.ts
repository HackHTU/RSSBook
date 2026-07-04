import { Elysia } from "elysia";
import { logger } from "@/utils";

/**
 * Logger Plugin
 *
 * Logs incoming requests to the server.
 */
export const loggerPlugin = new Elysia({
	name: "RSSBook/Logger",
}).onRequest(({ request }) => {
	// Ignore ely.sia internal requests
	if (new URL(request.url).hostname === "ely.sia") return;

	logger.info(`[Server] <- ${request.method} ${request.url}`);
});
