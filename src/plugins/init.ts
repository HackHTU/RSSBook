import { Elysia } from "elysia";
import { defaultTheme } from "@/books/theme";
import type { Meta, Theme } from "@/types";
import { Cache } from "@/utils";

export interface RSSBookInitConfig {
	feeds?: string[];
	meta?: Meta;
	cache?: Cache;
	config?: Record<string, string>;
	theme?: Theme;
}

export class RSSBook {
	cache: Cache;

	books: {
		feeds: string[];
		meta: Meta;
		theme: Theme;
	};

	config: Record<string, string>;

	constructor(init?: RSSBookInitConfig) {
		this.books = {
			feeds: init?.feeds || [],
			meta: init?.meta || {},
			theme: init?.theme || defaultTheme,
		};
		this.config = init?.config || {};
		this.cache = init?.cache || new Cache();
	}
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
		new RSSBook(config),
	);
