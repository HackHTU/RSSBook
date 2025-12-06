import { Elysia } from "elysia";
import { initPlugin } from "@/plugins";
import { date, formatHTML, load, logger, ofetch, toAbsoluteURL, uuid } from "@/utils";

/**
 * Inject Plugin
 *
 * Injects RSSBook utilities and configuration into the Elysia app context.
 */
export const injectPlugin = new Elysia({
	name: "RSSBook/Inject",
})
	.use(initPlugin()) // type inference
	// transform `Context` type, and only keep add some props
	.decorate(({ rssbook }) => {
		const { cache, config } = rssbook;

		const utils = {
			date,
			formatHTML,
			load,
			logger,
			ofetch,
			toAbsoluteURL,
			uuid,
		};

		return {
			cache,
			config,

			// from `@/utils`
			...utils,
		};
	});
