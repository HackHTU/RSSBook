/**
 * Bun Entry - Default app instance for Bun runtime
 */
import { createRSSBookApp } from "./RSSBookApp";

export const app = createRSSBookApp();
// For Bun's built-in fetch server
export default {
	fetch: app.fetch,
	port: 3000,
};

/**
 * RSSBook - RSS Feed Generator, Toolkit and Blog Platform
 * @module rssbook
 */

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
export type { RSSBookAppConfig } from "./RSSBookApp";
// Core App
export { createRSSBookApp } from "./RSSBookApp";
