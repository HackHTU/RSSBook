import { Elysia } from "elysia";
import { DEFAULT_THEME, getThemeByName, type ThemeName } from "@/books/themes";
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
	book?: RSSBookBookConfig;
	cache?: Cache;
}

function resolveTheme(theme?: ThemeName | Theme): Theme {
	if (!theme) return DEFAULT_THEME;
	if (typeof theme === "string") return getThemeByName(theme);
	return theme;
}

export function createRSSBook(init?: RSSBookInitConfig): RSSBook {
	return {
		books: {
			cacheMaxAgeMs: init?.book?.cacheMaxAgeMs || 10 * 60 * 1000,
			feeds: init?.book?.feeds || [],
			meta: init?.book?.meta || {},
			theme: resolveTheme(init?.book?.theme),
		},
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
			cache: config?.cache,
		}),
	);
