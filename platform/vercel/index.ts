/**
 * Vercel entrypoint
 */

import { Elysia } from "elysia";
import { createRSSBookApp } from "rssbook";

export default new Elysia().use(
	createRSSBookApp({
		book: {
			config: {},
			feeds: ["https://github.blog/feed/"],
			meta: {
				description: "A simple RSS feed aggregator and reader.",
				title: "RSSBook",
			},
		},
		openapi: {
			enableFetchOnlineServer: true,
		},
	}),
);
