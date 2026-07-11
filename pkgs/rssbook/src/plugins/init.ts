import { Elysia } from "elysia";
import { DEFAULT_THEME, getThemeByName, type ThemeName } from "@/books/themes";
import type { Browser } from "@/browser/browser";
import { BrowserUnavailableError, createUnavailableBrowser } from "@/browser/errors";
import { LocalPuppeteerBrowser } from "@/browser/local";
import { type Cache, MemoryCache } from "@/cache";
import type { Meta, Theme } from "@/types";

export type { ThemeName };

/**
 * Book initialization configuration.
 * Used to configure feeds, route config values, and theming.
 */
export interface RSSBookBookConfig {
	/** List of RSS feed URLs to aggregate */
	feeds?: string[];
	/** TTL in milliseconds for aggregated books feed data */
	cacheMaxAgeMs?: number;
	/** HTML meta tags for the rendered pages */
	meta?: Meta;
	/** Custom configuration key-value pairs */
	config?: Record<string, string>;
	/** Theme for rendering feed pages */
	theme?: ThemeName | Theme;
}

export interface RSSBook {
	browser: Browser;
	books: {
		cacheMaxAgeMs: number;
		feeds: string[];
		meta: Meta;
		theme: Theme;
	};
	cache: Cache;
	config: Record<string, string>;
}

export interface RSSBookInitConfig {
	/**
	 * Browser capability exposed to feed routes that declare
	 * `RouteConfig.browser: true`.
	 *
	 * `undefined` and `true` create RSSBook's lazy local Puppeteer Core
	 * `Browser`, using `PUPPETEER_EXECUTABLE_PATH` or the installed stable
	 * Chrome. `false` disables browser routes. Pass a `Browser` instance for
	 * CDP services or Puppeteer-compatible serverless SDKs.
	 */
	browser?: boolean | Browser;
	book?: RSSBookBookConfig;
	cache?: Cache;
}

function resolveTheme(theme?: ThemeName | Theme): Theme {
	if (!theme) return DEFAULT_THEME;
	if (typeof theme === "string") return getThemeByName(theme);
	return theme;
}

function resolveBrowser(browser?: boolean | Browser): Browser {
	if (browser === false) {
		return createUnavailableBrowser(() => new BrowserUnavailableError());
	}

	if (browser === undefined || browser === true) return new LocalPuppeteerBrowser();
	return browser;
}

export function createRSSBook(init?: RSSBookInitConfig): RSSBook {
	return {
		books: {
			cacheMaxAgeMs: init?.book?.cacheMaxAgeMs || 10 * 60 * 1000,
			feeds: init?.book?.feeds || [],
			meta: init?.book?.meta || {},
			theme: resolveTheme(init?.book?.theme),
		},
		browser: resolveBrowser(init?.browser),
		cache: init?.cache || new MemoryCache(),
		config: init?.book?.config || {},
	};
}

/**
 * Initialize RSSBook Plugin
 *
 * Init the RSSBook instance and decorate it to Elysia app.
 */
export const initPlugin = (config?: RSSBookInitConfig) => {
	const rssbook = createRSSBook({
		book: config?.book,
		browser: config?.browser,
		cache: config?.cache,
	});

	return new Elysia({ name: "RSSBook/Init" })
		.decorate(
			{ as: "append" }, // Inject ONLY if not exixts
			"rssbook",
			rssbook,
		)
		.onStop(async () => {
			await Promise.allSettled([rssbook.browser.deinit(), rssbook.cache.deinit()]);
		});
};
