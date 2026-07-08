import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { BrowserUnavailableError } from "@/browser/errors";
import { Cache } from "@/utils";
import { initPlugin } from "./init";

describe("initPlugin", () => {
	test("provides default RSSBook runtime state", async () => {
		const app = new Elysia().use(initPlugin()).get("/state", async ({ rssbook }) => {
			await rssbook.cache.set("plugin:init:default", "ok");

			return {
				cacheValue: await rssbook.cache.get("plugin:init:default"),
				feedCount: rssbook.books.feeds.length,
				maxAge: rssbook.books.cacheMaxAgeMs,
				themeRenderable: typeof rssbook.books.theme.render === "function",
			};
		});

		const response = await app.handle(new Request("http://localhost/state"));
		const body: {
			cacheValue: string;
			feedCount: number;
			maxAge: number;
			themeRenderable: boolean;
		} = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({
			cacheValue: "ok",
			feedCount: 0,
			maxAge: 600000,
			themeRenderable: true,
		});
	});

	test("uses caller-provided book config, cache, and disabled browser", async () => {
		const cache = new Cache();
		await cache.set("plugin:init:custom", "from-custom-cache");

		const app = new Elysia()
			.use(
				initPlugin({
					book: {
						cacheMaxAgeMs: 1234,
						config: {
							token: "secret",
						},
						feeds: ["https://example.com/feed.xml"],
					},
					browser: false,
					cache,
				}),
			)
			.get("/state", async ({ rssbook }) => {
				const renderResult = await rssbook.browser
					.renderHTML("https://example.com")
					.then(() => "available")
					.catch((error: unknown) =>
						error instanceof BrowserUnavailableError ? "unavailable" : "unexpected",
					);

				return {
					cacheValue: await rssbook.cache.get("plugin:init:custom"),
					configToken: rssbook.config.token,
					feeds: rssbook.books.feeds,
					maxAge: rssbook.books.cacheMaxAgeMs,
					renderResult,
				};
			});

		const response = await app.handle(new Request("http://localhost/state"));
		const body: {
			cacheValue: string;
			configToken: string;
			feeds: string[];
			maxAge: number;
			renderResult: string;
		} = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({
			cacheValue: "from-custom-cache",
			configToken: "secret",
			feeds: ["https://example.com/feed.xml"],
			maxAge: 1234,
			renderResult: "unavailable",
		});
	});
});
