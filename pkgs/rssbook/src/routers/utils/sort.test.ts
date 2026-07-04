import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { edenFetch } from "@elysiajs/eden";
import sortApp from "@/routers/utils/sort";

let server: ReturnType<typeof Bun.serve> | null = null;
const SERVER_PORT = 13583;
const APP_PORT = 13593;

// RSS feed with items in random order
const rssFeed = /* xml */ `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>Test Feed</title>
		<link>https://example.com</link>
		<description>A test feed for sorting</description>
		<item>
			<title>Middle Article</title>
			<link>https://example.com/middle</link>
			<description>Published in the middle</description>
			<pubDate>Wed, 15 Jan 2025 10:00:00 GMT</pubDate>
		</item>
		<item>
			<title>Oldest Article</title>
			<link>https://example.com/oldest</link>
			<description>The oldest article</description>
			<pubDate>Mon, 01 Jan 2025 10:00:00 GMT</pubDate>
		</item>
		<item>
			<title>Newest Article</title>
			<link>https://example.com/newest</link>
			<description>The newest article</description>
			<pubDate>Fri, 31 Jan 2025 10:00:00 GMT</pubDate>
		</item>
		<item>
			<title>Second Oldest</title>
			<link>https://example.com/second-oldest</link>
			<description>Second oldest article</description>
			<pubDate>Sun, 05 Jan 2025 10:00:00 GMT</pubDate>
		</item>
	</channel>
</rss>`;

const fetch = edenFetch<typeof sortApp>(`http://localhost:${APP_PORT}`);

beforeAll(() => {
	server = Bun.serve({
		port: SERVER_PORT,
		routes: {
			"/feed": () =>
				new Response(rssFeed, {
					headers: { "content-type": "application/rss+xml" },
				}),
		},
	});

	sortApp.listen(APP_PORT);
});

afterAll(() => {
	server?.stop();
	sortApp.stop();
});

describe("sortApp", () => {
	describe("/sort - default descending order", () => {
		test("should sort items in descending order by default (newest first)", async () => {
			const response = await fetch("/sort", {
				method: "GET",
				query: {
					feed: `http://localhost:${SERVER_PORT}/feed`,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.length).toBe(4);
			expect(response.data?.item?.[0]?.title).toBe("Newest Article");
			expect(response.data?.item?.[1]?.title).toBe("Middle Article");
			expect(response.data?.item?.[2]?.title).toBe("Second Oldest");
			expect(response.data?.item?.[3]?.title).toBe("Oldest Article");
		});
	});

	describe("/sort - order parameter", () => {
		test("should sort items in descending order when order=desc", async () => {
			const response = await fetch("/sort", {
				method: "GET",
				query: {
					feed: `http://localhost:${SERVER_PORT}/feed`,
					order: "desc",
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.[0]?.title).toBe("Newest Article");
			expect(response.data?.item?.[3]?.title).toBe("Oldest Article");
		});

		test("should sort items in ascending order when order=asc (oldest first)", async () => {
			const response = await fetch("/sort", {
				method: "GET",
				query: {
					feed: `http://localhost:${SERVER_PORT}/feed`,
					order: "asc",
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.[0]?.title).toBe("Oldest Article");
			expect(response.data?.item?.[1]?.title).toBe("Second Oldest");
			expect(response.data?.item?.[2]?.title).toBe("Middle Article");
			expect(response.data?.item?.[3]?.title).toBe("Newest Article");
		});
	});

	describe("/sort - override metadata", () => {
		test("should override feed metadata with JSON string", async () => {
			const overrideData = JSON.stringify({
				description: "Sorted by publication date",
				title: "Sorted Feed",
			});

			const response = await fetch("/sort", {
				method: "GET",
				query: {
					feed: `http://localhost:${SERVER_PORT}/feed`,
					override: overrideData,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.title).toBe("Sorted Feed");
			expect(response.data?.description).toBe("Sorted by publication date");
		});

		test("should combine sorting with override", async () => {
			const overrideData = JSON.stringify({
				title: "Ascending Sorted Feed",
			});

			const response = await fetch("/sort", {
				method: "GET",
				query: {
					feed: `http://localhost:${SERVER_PORT}/feed`,
					order: "asc",
					override: overrideData,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.title).toBe("Ascending Sorted Feed");
			expect(response.data?.item?.[0]?.title).toBe("Oldest Article");
		});
	});

	describe("/sort - feed metadata preservation", () => {
		test("should preserve original feed metadata when no override", async () => {
			const response = await fetch("/sort", {
				method: "GET",
				query: {
					feed: `http://localhost:${SERVER_PORT}/feed`,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.title).toBe("Test Feed");
			expect(response.data?.link).toBe("https://example.com");
			expect(response.data?.description).toBe("A test feed for sorting");
		});
	});
});
