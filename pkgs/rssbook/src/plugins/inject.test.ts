import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { initPlugin, injectPlugin } from "@/plugins";

describe("injectPlugin", () => {
	test("injects utilities and resolves runtime config from initPlugin", async () => {
		const app = new Elysia()
			.use(
				initPlugin({
					book: {
						config: {
							source: "unit-test",
						},
					},
					browser: false,
				}),
			)
			.use(injectPlugin)
			.get("/context", async ({ cache, config, formatHTML, toAbsoluteURL, uuid }) => {
				await cache.set("plugin:inject", "cache-hit");

				return {
					absoluteURL: toAbsoluteURL("/article", "https://example.com/root/"),
					cacheValue: await cache.get("plugin:inject"),
					configSource: config.source,
					sanitizedHTML: formatHTML(
						'<a href="/article">Read</a><script>alert("xss")</script>',
						"https://example.com/root/",
					),
					stableId: uuid("rssbook", 1),
				};
			});

		const response = await app.handle(new Request("http://localhost/context"));
		const body: {
			absoluteURL: string;
			cacheValue: string;
			configSource: string;
			sanitizedHTML: string;
			stableId: string;
		} = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({
			absoluteURL: "https://example.com/article",
			cacheValue: "cache-hit",
			configSource: "unit-test",
			sanitizedHTML: '<a href="https://example.com/article">Read</a>',
			stableId: "c0b131e3-45a1-54b5-9db9-1d863a6be509",
		});
	});
});
