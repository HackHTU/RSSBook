import { describe, expect, test } from "bun:test";
import { EMPTY_DATA } from "@/types";
import { Source } from "@/utils";

describe("source", () => {
	describe("constructor", () => {
		test("should initialize Source with valid slug", () => {
			const config = {
				description: "Test description",
				domain: "https://example.com",
				slug: "example",
				title: "Example Source",
			} as const;

			const source = new Source(config);
			expect(source.getConfig()).toBe(config);
			expect(source.getRoutes()).toEqual([]);
		});

		test("should throw error for slug with some special characters", () => {
			const config = {
				description: "Test description",
				domain: "https://example.com",
				slug: "example slug",
				title: "Example Source",
			} as const;

			// biome-ignore lint/suspicious/noExplicitAny: for test
			expect(() => new Source(config as any)).toThrow();
		});
	});

	describe("feed method", () => {
		test("should add route correctly", () => {
			const sourceConfig = {
				description: "Test description",
				domain: "https://example.com",
				slug: "example",
				title: "Example Source",
			} as const;

			const routeConfig = {
				description: "A test route",
				language: "en",
				maintainer: {
					name: "Tester",
				},
				title: "test-route",
			} as const;

			const source = new Source(sourceConfig);
			source.feed(routeConfig, (app) => app);

			expect(source.getRoutes()).toHaveLength(1);
			expect(source.getRoutes()[0]).toBe(routeConfig);
		});

		test("should throw error for duplicate route name", () => {
			const sourceConfig = {
				description: "Test description",
				domain: "https://example.com",
				slug: "example",
				title: "Example Source",
			} as const;

			const routeConfig = {
				description: "Test route",
				language: "en",
				maintainer: { name: "Tester" },
				title: "test-route",
			} as const;

			const source = new Source(sourceConfig);
			source.feed(routeConfig, (app) => app);

			expect(() => {
				source.feed(routeConfig, (app) => app);
			}).toThrow();
		});

		test("should inject `Context` into handler", async () => {
			const sourceConfig = {
				config: {
					EXAMPLE_must: {
						default: "config",
						description: "A must config",
					},
					EXAMPLE_optional: {
						description: "An optional config",
					},
				},
				description: "Test description",
				domain: "https://example.com",
				slug: "example",
				title: "Example Source",
			} as const;
			const routeConfig = {
				description: "Test route",
				language: "en",
				maintainer: { name: "Tester" },
				title: "test-route",
			} as const;
			const source = new Source(sourceConfig);

			source.feed(routeConfig, (app) =>
				app.get("/test", (ctx) => {
					const { date, formatHTML, meta, toAbsoluteURL, uuid, logger, load, ofetch } = ctx;

					expect(meta).toBe({
						...sourceConfig,
						config: {
							EXAMPLE_must: "config",
							EXAMPLE_optional: undefined,
						},
					});

					[date, formatHTML, meta, toAbsoluteURL, uuid, logger, load, ofetch].forEach((item) => {
						expect(item).toBeFunction();
					});

					return EMPTY_DATA;
				}),
			);

			await source.getApp().handle(new Request("https://example.com/test"));
		});
	});

	describe("app instance", () => {
		test("should return Elysia app instance", () => {
			const sourceConfig = {
				description: "Test description",
				domain: "https://example.com",
				slug: "example",
				title: "Example Source",
			} as const;

			const source = new Source(sourceConfig);
			const app = source.getApp();
			expect(app).toBeDefined();
			expect(typeof app.handle).toBe("function");
		});

		test("should handle multiple routes", () => {
			const sourceConfig = {
				description: "Test description",
				domain: "https://example.com",
				slug: "example",
				title: "Example Source",
			} as const;

			const source = new Source(sourceConfig);

			source.feed(
				{
					description: "Route 1",
					language: "en",
					maintainer: { name: "Tester" },
					title: "route-1",
				},
				(app) => app,
			);

			source.feed(
				{
					description: "Route 2",
					language: "en",
					maintainer: { name: "Tester" },
					title: "route-2",
				},
				(app) => app,
			);

			expect(source.getRoutes()).toHaveLength(2);
		});
	});
});
