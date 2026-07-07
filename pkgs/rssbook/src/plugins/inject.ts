import { Elysia } from "elysia";
import { createUnavailableBrowser } from "@/browser/context";
import { BrowserUnavailableError } from "@/browser/errors";
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
		const { cache, config, browser } = rssbook;

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
			browser,
			cache,
			config,

			// from `@/utils`
			...utils,
		};
	});
