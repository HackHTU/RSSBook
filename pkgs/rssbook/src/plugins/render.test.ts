import { describe, expect, test } from "bun:test";
import { openapi } from "@elysiajs/openapi";
import { Elysia, t } from "elysia";
import { renderPlugin } from "./render";

describe("renderPlugin", () => {
	test("honors styled=false query after boolean coercion", async () => {
		const app = new Elysia().use(renderPlugin).get("/demo", () => ({
			description: "Demo feed",
			item: [],
			link: "https://example.com",
			title: "Demo",
		}));

		const response = await app.handle(
			new Request("http://localhost/demo?styled=false&type=rss"),
		);
		const xml = await response.text();

		expect(response.status).toBe(200);
		expect(xml).not.toContain("xml-stylesheet");
	});

	test("keeps route query schema when adding render query parameters to OpenAPI", async () => {
		const app = new Elysia()
			.use(openapi())
			.use(renderPlugin)
			.get(
				"/demo",
				() => ({
					description: "Demo feed",
					item: [],
					link: "https://example.com",
					title: "Demo",
				}),
				{
					query: t.Object({
						foo: t.String({
							description: "Route-specific query parameter.",
						}),
					}),
				},
			);

		const response = await app.handle(new Request("http://localhost/openapi/json"));
		const document = (await response.json()) as {
			paths: {
				"/demo": {
					get: {
						parameters: { name: string }[];
					};
				};
			};
		};

		expect(document.paths["/demo"].get.parameters.map(({ name }) => name)).toEqual([
			"foo",
			"styled",
			"type",
		]);
	});
});
