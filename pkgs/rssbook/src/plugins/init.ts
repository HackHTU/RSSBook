import { Elysia } from "elysia";
import { DEFAULT_THEME, getThemeByName, type ThemeName } from "@/books/themes";
import { Browser, type BrowserOptions } from "@/browser/browser";
import type { Meta, Theme } from "@/types";
import { Cache } from "@/utils";

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
	browser?: Browser;
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
	 * `undefined` and `true` create RSSBook's lazy Puppeteer-backed `Browser`.
	 * `false` disables browser routes. Pass a `Browser` instance, `Browser`
	 * options, or an async factory to use Browser as a Service or serverless
	 * browser providers.
	 */
	browser?: boolean | Browser | BrowserOptions;
	book?: RSSBookBookConfig;
	cache?: Cache;
}

function resolveTheme(theme?: ThemeName | Theme): Theme {
	if (!theme) return DEFAULT_THEME;
	if (typeof theme === "string") return getThemeByName(theme);
	return theme;
}

function resolveBrowser(browser?: boolean | Browser | BrowserOptions): Browser | undefined {
	if (browser === false) return undefined;
	if (browser instanceof Browser) return browser;
	if (browser === undefined || browser === true) return new Browser();

	return new Browser(browser);
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
		cache: init?.cache || new Cache(),
		config: init?.book?.config || {},
	};
}

/**
 * Initialize RSSBook Plugin
 *
 * Init the RSSBook instance and decorate it to Elysia app.
 */
export const initPlugin = (config?: RSSBookInitConfig) =>
	new Elysia({ name: "RSSBook/Init" }).decorate(
		{ as: "append" }, // Inject ONLY if not exixts
		"rssbook",
		createRSSBook({
			book: config?.book,
			browser: config?.browser,
			cache: config?.cache,
		}),
	);
