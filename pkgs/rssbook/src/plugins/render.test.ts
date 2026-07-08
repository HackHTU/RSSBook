import { describe, expect, test } from "bun:test";
import { openapi } from "@elysiajs/openapi";
import { Elysia, t } from "elysia";
import { renderPlugin } from "./render";

const demoFeed = {
	description: "Demo feed",
	item: [
		{
			date: new Date("2024-01-01T00:00:00.000Z"),
			description: "Demo entry",
			link: "https://example.com/posts/1",
			title: "First post",
		},
	],
	link: "https://example.com",
	title: "Demo",
};

describe("renderPlugin", () => {
	test("honors styled=false query after boolean coercion", async () => {
		const app = new Elysia().use(renderPlugin).get("/demo", () => demoFeed);

		const response = await app.handle(new Request("http://localhost/demo?styled=false&type=rss"));
		const xml = await response.text();

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe("application/xml");
		expect(xml.match(/^<\?xml-stylesheet/g)).toBeNull();
		expect(xml.match(/<item>/g)).toHaveLength(1);
	});

	test("renders JSON feed output as JSON Feed data", async () => {
		const app = new Elysia().use(renderPlugin).get("/demo", () => demoFeed);

		const response = await app.handle(new Request("http://localhost/demo?type=json"));
		const body: {
			description: string;
			items: {
				content_html: string;
				date_modified: string;
				title: string;
				url: string;
			}[];
			title: string;
			version: string;
		} = await response.json();

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe("application/json");
		expect(body).toMatchObject({
			description: "Demo feed",
			title: "Demo",
			version: "https://jsonfeed.org/version/1",
		});
		expect(body.items).toEqual([
			{
				content_html: "Demo entry",
				date_modified: "2024-01-01T00:00:00.000Z",
				title: "First post",
				url: "https://example.com/posts/1",
			},
		]);
	});

	test("returns raw feed data without renderer normalization", async () => {
		const app = new Elysia().use(renderPlugin).get("/demo", () => demoFeed);

		const response = await app.handle(new Request("http://localhost/demo?type=raw"));
		const body: {
			description: string;
			item: {
				date: string;
				description: string;
				link: string;
				title: string;
			}[];
			link: string;
			title: string;
		} = await response.json();

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe("application/json");
		expect(body).toEqual({
			...demoFeed,
			item: [
				{
					...demoFeed.item[0],
					date: "2024-01-01T00:00:00.000Z",
				},
			],
		});
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
