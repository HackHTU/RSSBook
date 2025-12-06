import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { edenFetch } from "@elysiajs/eden";
import unionApp from "@/routers/utils/union";

let server: ReturnType<typeof Bun.serve> | null = null;
const SERVER_PORT = 13587;
const APP_PORT = 13597;

// Feed 1 - has items A, B
const feed1 = /* xml */ `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>Feed One</title>
		<link>https://feed1.example.com</link>
		<description>First test feed</description>
		<item>
			<title>Article A</title>
			<link>https://example.com/article-a</link>
			<description>First article from feed one</description>
			<pubDate>Mon, 15 Jan 2025 10:00:00 GMT</pubDate>
		</item>
		<item>
			<title>Article B</title>
			<link>https://example.com/article-b</link>
			<description>Second article from feed one</description>
			<pubDate>Tue, 16 Jan 2025 10:00:00 GMT</pubDate>
		</item>
	</channel>
</rss>`;

// Feed 2 - has items C, D (different from feed 1)
const feed2 = /* xml */ `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>Feed Two</title>
		<link>https://feed2.example.com</link>
		<description>Second test feed</description>
		<item>
			<title>Article C</title>
			<link>https://example.com/article-c</link>
			<description>First article from feed two</description>
			<pubDate>Wed, 17 Jan 2025 10:00:00 GMT</pubDate>
		</item>
		<item>
			<title>Article D</title>
			<link>https://example.com/article-d</link>
			<description>Second article from feed two</description>
			<pubDate>Thu, 18 Jan 2025 10:00:00 GMT</pubDate>
		</item>
	</channel>
</rss>`;

// Feed 3 - has items E, A (A is duplicate with feed 1)
const feed3 = /* xml */ `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>Feed Three</title>
		<link>https://feed3.example.com</link>
		<description>Third test feed</description>
		<item>
			<title>Article E</title>
			<link>https://example.com/article-e</link>
			<description>Unique article from feed three</description>
			<pubDate>Fri, 19 Jan 2025 10:00:00 GMT</pubDate>
		</item>
		<item>
			<title>Article A</title>
			<link>https://example.com/article-a</link>
			<description>Duplicate of article A</description>
			<pubDate>Mon, 15 Jan 2025 10:00:00 GMT</pubDate>
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

const fetch = edenFetch<typeof unionApp>(`http://localhost:${APP_PORT}`);

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

	unionApp.listen(APP_PORT);
});

afterAll(() => {
	server?.stop();
	unionApp.stop();
});

describe("unionApp", () => {
	describe("/union - basic union", () => {
		test("should merge items from two feeds", async () => {
			const response = await fetch("/union", {
				method: "GET",
				query: {
					feeds: [`http://localhost:${SERVER_PORT}/feed1`, `http://localhost:${SERVER_PORT}/feed2`],
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.length).toBe(4); // A, B, C, D
			expect(response.data?.item?.some((item) => item.title === "Article A")).toBe(true);
			expect(response.data?.item?.some((item) => item.title === "Article B")).toBe(true);
			expect(response.data?.item?.some((item) => item.title === "Article C")).toBe(true);
			expect(response.data?.item?.some((item) => item.title === "Article D")).toBe(true);
		});

		test("should merge items from three feeds", async () => {
			const response = await fetch("/union", {
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
			// A, B from feed1, C, D from feed2, E from feed3 (A is deduplicated)
			expect(response.data?.item?.length).toBe(5);
		});
	});

	describe("/union - deduplication", () => {
		test("should deduplicate items with same link", async () => {
			const response = await fetch("/union", {
				method: "GET",
				query: {
					feeds: [`http://localhost:${SERVER_PORT}/feed1`, `http://localhost:${SERVER_PORT}/feed3`],
				},
			});

			expect(response.data).toBeDefined();
			// A, B from feed1, E from feed3 (A in feed3 is duplicate)
			expect(response.data?.item?.length).toBe(3);

			// Count how many Article A items there are (should be 1)
			const articleACount = response.data?.item?.filter(
				(item) => item.title === "Article A",
			).length;
			expect(articleACount).toBe(1);
		});
	});

	describe("/union - override metadata", () => {
		test("should override feed metadata with JSON string", async () => {
			const overrideData = JSON.stringify({
				description: "Combined feed from multiple sources",
				language: "en",
				title: "Union Feed",
			});

			const response = await fetch("/union", {
				method: "GET",
				query: {
					feeds: [`http://localhost:${SERVER_PORT}/feed1`, `http://localhost:${SERVER_PORT}/feed2`],
					override: overrideData,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.title).toBe("Union Feed");
			expect(response.data?.description).toBe("Combined feed from multiple sources");
			expect(response.data?.language).toBe("en");
		});
	});

	describe("/union - feed metadata", () => {
		test("should use first feed metadata as base", async () => {
			const response = await fetch("/union", {
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

	describe("/union - empty feeds", () => {
		test("should handle union with empty feed", async () => {
			const response = await fetch("/union", {
				method: "GET",
				query: {
					feeds: [`http://localhost:${SERVER_PORT}/feed1`, `http://localhost:${SERVER_PORT}/empty`],
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.length).toBe(2); // Only A, B from feed1
		});
	});
});
