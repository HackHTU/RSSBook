/**
 * RSSBook - RSS Feed Generator, Toolkit and Blog Platform
 * @module rssbook
 */
import { createRSSBookApp } from "./app";

let app: ReturnType<typeof createRSSBookApp> | undefined;

const getApp = () => {
	app ??= createRSSBookApp();
	return app;
};

// For Bun's built-in fetch server. The app is created lazily on the first request.
export default {
	fetch: (request: Request) => getApp().fetch(request),
};

export {
	Browser,
	type BrowserDisposeMode,
	type BrowserDisposer,
	type BrowserFactory,
	type BrowserOptions,
	blockResources,
	cookieHeaderToParams,
	cookiesToHeader,
	getCookieHeader,
	setCookieHeader,
	waitForResponseJSON,
} from "@/browser";
export type { RSSBook, RSSBookBookConfig, RSSBookInitConfig } from "@/plugins/init";
export { createRSSBook } from "@/plugins/init";
// Types
export type {
	Author,
	Data,
	DataItem,
	Enclosure,
	FeedType,
	Language,
} from "@/types/data";
export type { Meta } from "@/types/meta";
export type { RouteConfig } from "@/types/route";
export type { Config, SourceConfigs } from "@/types/source";
export type { Theme, ThemeProps } from "@/types/theme";
// Classes
export { Cache } from "@/utils/cache";
export { Category } from "@/utils/category";
export { detectLanguage } from "@/utils/detectLanguage";
// Feed utilities
export { filter, intersection, parse, render, sort, union } from "@/utils/feeds";
export { formatHTML } from "@/utils/formatHTML";
export { load } from "@/utils/load";
export { logger } from "@/utils/logger";
// Other utilities
export { ofetch } from "@/utils/ofetch";
export { Source } from "@/utils/source";
export { toAbsoluteURL } from "@/utils/toAbsoluteURL";
export type { RSSBookAppConfig } from "./app";
// Core App
export { createRSSBookApp } from "./app";
