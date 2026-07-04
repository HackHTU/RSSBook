import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { edenFetch } from "@elysiajs/eden";
import intersectionApp from "@/routers/utils/intersection";

let server: ReturnType<typeof Bun.serve> | null = null;
const SERVER_PORT = 13582;
const APP_PORT = 13592;

// Feed 1 - has items A, B, C
const feed1 = /* xml */ `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>Feed One</title>
		<link>https://feed1.example.com</link>
		<description>First test feed</description>
		<item>
			<title>Common Article A</title>
			<link>https://example.com/article-a</link>
			<description>This article appears in both feeds</description>
			<pubDate>Mon, 15 Jan 2025 10:00:00 GMT</pubDate>
		</item>
		<item>
			<title>Common Article B</title>
			<link>https://example.com/article-b</link>
			<description>Another common article</description>
			<pubDate>Tue, 16 Jan 2025 10:00:00 GMT</pubDate>
		</item>
		<item>
			<title>Feed One Exclusive</title>
			<link>https://example.com/feed1-only</link>
			<description>This only appears in feed one</description>
			<pubDate>Wed, 17 Jan 2025 10:00:00 GMT</pubDate>
		</item>
	</channel>
</rss>`;

// Feed 2 - has items A, B, D
const feed2 = /* xml */ `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>Feed Two</title>
		<link>https://feed2.example.com</link>
		<description>Second test feed</description>
		<item>
			<title>Common Article A</title>
			<link>https://example.com/article-a</link>
			<description>This article appears in both feeds</description>
			<pubDate>Mon, 15 Jan 2025 10:00:00 GMT</pubDate>
		</item>
		<item>
			<title>Common Article B</title>
			<link>https://example.com/article-b</link>
			<description>Another common article</description>
			<pubDate>Tue, 16 Jan 2025 10:00:00 GMT</pubDate>
		</item>
		<item>
			<title>Feed Two Exclusive</title>
			<link>https://example.com/feed2-only</link>
			<description>This only appears in feed two</description>
			<pubDate>Thu, 18 Jan 2025 10:00:00 GMT</pubDate>
		</item>
	</channel>
</rss>`;

// Feed 3 - has items A, E (only A is common with feed1 and feed2)
const feed3 = /* xml */ `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>Feed Three</title>
		<link>https://feed3.example.com</link>
		<description>Third test feed</description>
		<item>
			<title>Common Article A</title>
			<link>https://example.com/article-a</link>
			<description>This article appears in all feeds</description>
			<pubDate>Mon, 15 Jan 2025 10:00:00 GMT</pubDate>
		</item>
		<item>
			<title>Feed Three Exclusive</title>
			<link>https://example.com/feed3-only</link>
			<description>This only appears in feed three</description>
			<pubDate>Fri, 19 Jan 2025 10:00:00 GMT</pubDate>
		</item>
	</channel>
</rss>`;

// Empty feed
const emptyFeed = /* xml */ `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>Empty Feed</title>
		<link>https://empty.example.com</link>
		<description>An empty feed with no items</description>
	</channel>
</rss>`;

const fetch = edenFetch<typeof intersectionApp>(`http://localhost:${APP_PORT}`);

beforeAll(() => {
	server = Bun.serve({
		port: SERVER_PORT,
		routes: {
			"/empty": () =>
				new Response(emptyFeed, {
					headers: { "content-type": "application/rss+xml" },
				}),
			"/feed1": () =>
				new Response(feed1, {
					headers: { "content-type": "application/rss+xml" },
				}),
			"/feed2": () =>
				new Response(feed2, {
					headers: { "content-type": "application/rss+xml" },
				}),
			"/feed3": () =>
				new Response(feed3, {
					headers: { "content-type": "application/rss+xml" },
				}),
		},
	});

	intersectionApp.listen(APP_PORT);
});

afterAll(() => {
	server?.stop();
	intersectionApp.stop();
});

describe("intersectionApp", () => {
	describe("/intersection - basic intersection", () => {
		test("should find common items between two feeds", async () => {
			const response = await fetch("/intersection", {
				method: "GET",
				query: {
					feeds: [`http://localhost:${SERVER_PORT}/feed1`, `http://localhost:${SERVER_PORT}/feed2`],
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.length).toBe(2); // Common Article A and B
			expect(response.data?.item?.some((item) => item.title === "Common Article A")).toBe(true);
			expect(response.data?.item?.some((item) => item.title === "Common Article B")).toBe(true);
		});

		test("should find common items across three feeds", async () => {
			const response = await fetch("/intersection", {
				method: "GET",
				query: {
					feeds: [
						`http://localhost:${SERVER_PORT}/feed1`,
						`http://localhost:${SERVER_PORT}/feed2`,
						`http://localhost:${SERVER_PORT}/feed3`,
					],
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.length).toBe(1); // Only Common Article A
			expect(response.data?.item?.[0]?.title).toBe("Common Article A");
		});

		test("should return empty items when no common items exist", async () => {
			const response = await fetch("/intersection", {
				method: "GET",
				query: {
					feeds: [`http://localhost:${SERVER_PORT}/feed1`, `http://localhost:${SERVER_PORT}/empty`],
				},
			});

			expect(response.data).toBeDefined();
			// Should have no items or undefined items
			expect(response.data?.item?.length ?? 0).toBe(0);
		});
	});

	describe("/intersection - override metadata", () => {
		test("should override feed metadata with JSON string", async () => {
			const overrideData = JSON.stringify({
				description: "Common articles across multiple sources",
				title: "Intersection Feed",
			});

			const response = await fetch("/intersection", {
				method: "GET",
				query: {
					feeds: [`http://localhost:${SERVER_PORT}/feed1`, `http://localhost:${SERVER_PORT}/feed2`],
					override: overrideData,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.title).toBe("Intersection Feed");
			expect(response.data?.description).toBe("Common articles across multiple sources");
		});
	});

	describe("/intersection - feed metadata", () => {
		test("should use first feed metadata as base", async () => {
			const response = await fetch("/intersection", {
				method: "GET",
				query: {
					feeds: [`http://localhost:${SERVER_PORT}/feed1`, `http://localhost:${SERVER_PORT}/feed2`],
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.title).toBe("Feed One");
			expect(response.data?.link).toBe("https://feed1.example.com");
		});
	});
});
