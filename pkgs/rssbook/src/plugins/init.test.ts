import { describe, expect, mock, test } from "bun:test";
import { Elysia } from "elysia";
import type { Browser as PuppeteerBrowser } from "puppeteer-core";
import { Browser, BrowserClosedError } from "@/browser";
import { BrowserUnavailableError } from "@/browser/errors";
import { MemoryCache } from "@/cache";
import { initPlugin } from "./init";

describe("initPlugin", () => {
	test("deinitializes the app-owned Browser on stop without initializing it", async () => {
		const browser = new NeverBrowser();
		const app = new Elysia().use(initPlugin({ browser }));

		for (const hook of app.event.stop ?? []) {
			await hook.fn(app);
		}

		expect(browser.create).not.toHaveBeenCalled();
		await expect(browser.init()).rejects.toBeInstanceOf(BrowserClosedError);
	});

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
		const cache = new MemoryCache();
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
					.init()
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

class NeverBrowser extends Browser {
	public readonly create = mock(async () => {
		throw new Error("should not initialize");
	});

	public constructor() {
		super({ maxBrowsers: 1, maxContextsPerBrowser: 1, maxPagesPerContext: 1 });
	}

	protected createBrowser(): Promise<PuppeteerBrowser> {
		return this.create();
	}
}
