import { serverTiming } from "@elysiajs/server-timing";
import { Elysia, type ElysiaAdapter } from "elysia";
import { bookPlugin } from "@/books";
import type { ThemeName } from "@/books/themes";
import {
	assetsPlugin,
	errorHandlerPlugin,
	initPlugin,
	loggerPlugin,
	openAPIPlugin,
	type RSSBookBookConfig,
} from "@/plugins";
import { routePlugin } from "@/routers";
import type { Meta } from "@/types";
import type { Cache } from "@/utils";

/**
 * String-only environment variables supported by RSSBook's default app config.
 */
const RSSBOOK_APP_ENV = {
	/**
	 * Cache TTL in milliseconds for aggregated book feed data.
	 *
	 * @example
	 * RSSBOOK_BOOK_CACHE_MAX_AGE_MS="600000"
	 */
	RSSBOOK_BOOK_CACHE_MAX_AGE_MS: process.env.RSSBOOK_BOOK_CACHE_MAX_AGE_MS,
	/**
	 * Feed source config values. Use comma-separated `key=value` pairs.
	 *
	 * @example
	 * RSSBOOK_BOOK_CONFIG="GITHUB_TOKEN=token,DISCORD_TOKEN=token"
	 */
	RSSBOOK_BOOK_CONFIG: process.env.RSSBOOK_BOOK_CONFIG,
	/**
	 * Feed URLs aggregated by the book page. Use a comma-separated string for arrays.
	 * Defaults to RSSBook's GitHub trending daily feed when not set.
	 *
	 * @example
	 * RSSBOOK_BOOK_FEEDS="https://rssbook.htu.me/feeds/programming/github/trending/daily"
	 */
	RSSBOOK_BOOK_FEEDS:
		process.env.RSSBOOK_BOOK_FEEDS ??
		"https://rssbook.htu.me/feeds/programming/github/trending/daily",
	/**
	 * Built-in book theme name.
	 *
	 * @example
	 * RSSBOOK_BOOK_THEME="redbook"
	 */
	RSSBOOK_BOOK_THEME: process.env.RSSBOOK_BOOK_THEME,
	/**
	 * Page description rendered in HTML metadata.
	 *
	 * @example
	 * RSSBOOK_META_DESCRIPTION="A simple RSS feed aggregator and reader."
	 */
	RSSBOOK_META_DESCRIPTION: process.env.RSSBOOK_META_DESCRIPTION,
	/**
	 * Page keywords rendered in HTML metadata. Use a comma-separated string for arrays.
	 *
	 * @example
	 * RSSBOOK_META_KEYWORDS="rss,reader,feeds"
	 */
	RSSBOOK_META_KEYWORDS: process.env.RSSBOOK_META_KEYWORDS,
	/**
	 * HTML language value.
	 *
	 * @example
	 * RSSBOOK_META_LANG="en"
	 */
	RSSBOOK_META_LANG: process.env.RSSBOOK_META_LANG,
	/**
	 * Page title rendered in HTML metadata.
	 *
	 * @example
	 * RSSBOOK_META_TITLE="RSSBook"
	 */
	RSSBOOK_META_TITLE: process.env.RSSBOOK_META_TITLE,
	/**
	 * Enable fetching public online server entries for the OpenAPI server list.
	 *
	 * @example
	 * RSSBOOK_OPENAPI_ENABLE_FETCH_ONLINE_SERVER="true"
	 */
	RSSBOOK_OPENAPI_ENABLE_FETCH_ONLINE_SERVER:
		process.env.RSSBOOK_OPENAPI_ENABLE_FETCH_ONLINE_SERVER,
	/**
	 * Enable static asset serving.
	 *
	 * @example
	 * RSSBOOK_STATIC="false"
	 */
	RSSBOOK_STATIC: process.env.RSSBOOK_STATIC,
} satisfies Record<string, string | undefined>;

/**
 * Configuration options for creating an RSSBook application.
 */
export interface RSSBookAppConfig {
	adapter?: ElysiaAdapter;
	book?: RSSBookBookConfig;
	cache?: Cache;
	openapi?: {
		/** Enable the online fetch server for proxying requests */
		enableFetchOnlineServer?: boolean;
	};
	/** Enable the static file serving plugin */
	static?: boolean;
}

const parseCommaSeparated = (value: string | undefined) => {
	const items = value
		?.split(",")
		.map((item) => item.trim())
		.filter(Boolean);

	return items?.length ? items : undefined;
};

const parseBoolean = (value: string | undefined) => {
	if (!value) return undefined;

	switch (value.trim().toLowerCase()) {
		case "1":
		case "true":
		case "yes":
		case "on":
			return true;
		case "0":
		case "false":
		case "no":
		case "off":
			return false;
		default:
			return undefined;
	}
};

const parseNumber = (value: string | undefined) => {
	if (!value) return undefined;

	const number = Number(value);
	return Number.isFinite(number) ? number : undefined;
};

const parseConfig = (value: string | undefined) => {
	const entries = parseCommaSeparated(value);
	if (!entries) return undefined;

	const config: Record<string, string> = {};

	for (const entry of entries) {
		const separatorIndex = entry.indexOf("=");
		if (separatorIndex <= 0) continue;

		const key = entry.slice(0, separatorIndex).trim();
		if (!key) continue;

		config[key] = entry.slice(separatorIndex + 1).trim();
	}

	return Object.keys(config).length ? config : undefined;
};

const resolveEnvTheme = (theme: string | undefined): ThemeName | undefined => {
	switch (theme) {
		case "gallery":
		case "magazine":
		case "masonry":
		case "minimal":
		case "reader":
		case "redbook":
			return theme;
		default:
			return undefined;
	}
};

const hasMetaValue = (meta: Meta) => Object.values(meta).some((value) => value !== undefined);

/**
 * Convert string-only process env values into RSSBook app config.
 *
 * Arrays are represented as comma-separated strings; source config values use
 * comma-separated `key=value` pairs. Runtime objects like adapters and cache
 * adapters are intentionally excluded from env config.
 *
 * @example
 * getProcessedEnv({
 *   RSSBOOK_BOOK_FEEDS: "https://github.blog/feed/,https://example.com/feed.xml",
 *   RSSBOOK_BOOK_CACHE_MAX_AGE_MS: "600000",
 *   RSSBOOK_BOOK_CONFIG: "GITHUB_TOKEN=token",
 *   RSSBOOK_META_TITLE: "RSSBook",
 *   RSSBOOK_OPENAPI_ENABLE_FETCH_ONLINE_SERVER: "true",
 * });
 */
function getProcessedEnv(source: Record<string, string | undefined>): RSSBookAppConfig {
	const meta: Meta = {
		description: source.RSSBOOK_META_DESCRIPTION,
		keywords: parseCommaSeparated(source.RSSBOOK_META_KEYWORDS),
		lang: source.RSSBOOK_META_LANG,
		title: source.RSSBOOK_META_TITLE,
	};

	return {
		book: {
			cacheMaxAgeMs: parseNumber(source.RSSBOOK_BOOK_CACHE_MAX_AGE_MS),
			config: parseConfig(source.RSSBOOK_BOOK_CONFIG),
			feeds: parseCommaSeparated(source.RSSBOOK_BOOK_FEEDS),
			meta: hasMetaValue(meta) ? meta : undefined,
			theme: resolveEnvTheme(source.RSSBOOK_BOOK_THEME),
		},
		openapi: {
			enableFetchOnlineServer: parseBoolean(source.RSSBOOK_OPENAPI_ENABLE_FETCH_ONLINE_SERVER),
		},
		static: parseBoolean(source.RSSBOOK_STATIC),
	};
}

const env = getProcessedEnv(RSSBOOK_APP_ENV);

const mergeAppConfig = (init?: RSSBookAppConfig): RSSBookAppConfig => ({
	...env,

	...init,
	book: {
		...env.book,
		...init?.book,
		meta: {
			...env.book?.meta,
			...init?.book?.meta,
		},
	},
	openapi: {
		...env.openapi,
		...init?.openapi,
	},
});

/**
 * Create RSSBook main app
 * @param init RSSBook initialization config
 * @return Elysia app instance
 */
export const createRSSBookApp = (init?: RSSBookAppConfig) => {
	const config = mergeAppConfig(init);

	return (
		new Elysia({
			adapter: config.adapter,
			name: "RSSBook/App",
		})
			// error boundary plugin
			.use(errorHandlerPlugin)
			// server timing plugin
			.use(serverTiming())
			// request logging
			.use(loggerPlugin)
			// generate openapi doc
			.use(openAPIPlugin(config.openapi?.enableFetchOnlineServer))

			// init RSSBook instance
			.use(initPlugin({ book: config.book, cache: config.cache }))
			// book plugin
			.use(bookPlugin)
			// sign routes plugin
			.use(routePlugin)
			// static assets plugin
			.use(assetsPlugin(config.static))
	);
};
