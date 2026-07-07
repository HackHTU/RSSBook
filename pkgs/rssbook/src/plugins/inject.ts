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
	// Static utilities from `@/utils`.
	.decorate({
		date,
		formatHTML,
		load,
		logger,
		ofetch,
		toAbsoluteURL,
		uuid,
	})
	// Runtime values must follow the actual app-level initPlugin config.
	.resolve({ as: "scoped" }, ({ rssbook }) => ({
		browser: rssbook.browser,
		cache: rssbook.cache,
		config: rssbook.config,
	}));
