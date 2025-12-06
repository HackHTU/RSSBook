import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { edenFetch } from "@elysiajs/eden";
import filterApp from "@/routers/utils/filter";

let server: ReturnType<typeof Bun.serve> | null = null;
const SERVER_PORT = 13581;
const APP_PORT = 13591;

// RSS feed with multiple items for filtering tests
const rssFeed = /* xml */ `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>Test Feed</title>
		<link>https://example.com</link>
		<description>A test feed for filtering</description>
		<item>
			<title>AI Technology News</title>
			<link>https://example.com/ai-tech</link>
			<description>Latest updates on AI technology</description>
			<pubDate>Wed, 15 Jan 2025 10:00:00 GMT</pubDate>
			<author>John Doe</author>
			<category>technology</category>
			<category>AI</category>
		</item>
		<item>
			<title>Programming Tutorial</title>
			<link>https://example.com/programming</link>
			<description>Learn programming basics</description>
			<pubDate>Thu, 10 Jan 2025 08:00:00 GMT</pubDate>
			<author>Jane Smith</author>
			<category>programming</category>
			<category>tutorial</category>
		</item>
		<item>
			<title>Spam Content Here</title>
			<link>https://example.com/spam</link>
			<description>This is spam content with ads</description>
			<pubDate>Fri, 05 Jan 2025 12:00:00 GMT</pubDate>
			<author>Spam Bot</author>
			<category>spam</category>
		</item>
		<item>
			<title>Machine Learning Guide</title>
			<link>https://example.com/ml-guide</link>
			<description>Complete guide to machine learning</description>
			<pubDate>Mon, 20 Jan 2025 14:00:00 GMT</pubDate>
			<author>John Doe</author>
			<category>AI</category>
			<category>machine learning</category>
		</item>
		<item>
			<title>Old Article</title>
			<link>https://example.com/old</link>
			<description>An old article from last year</description>
			<pubDate>Sun, 01 Dec 2024 09:00:00 GMT</pubDate>
			<author>Jane Smith</author>
			<category>archive</category>
		</item>
	</channel>
</rss>`;

const fetch = edenFetch<typeof filterApp>(`http://localhost:${APP_PORT}`);

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

	filterApp.listen(APP_PORT);
});

afterAll(() => {
	server?.stop();
	filterApp.stop();
});

describe("filterApp", () => {
	describe("/filter - keyword filtering", () => {
		test("should filter items by include keyword", async () => {
			const response = await fetch("/filter", {
				method: "GET",
				query: {
					feed: `http://localhost:${SERVER_PORT}/feed`,
					include: "AI",
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.length).toBeGreaterThan(0);
			expect(
				response.data?.item?.every(
					(item) =>
						item.title?.toLowerCase().includes("ai") ||
						item.description?.toLowerCase().includes("ai"),
				),
			).toBe(true);
		});

		test("should filter items by exclude keyword", async () => {
			const response = await fetch("/filter", {
				method: "GET",
				query: {
					exclude: "spam",
					feed: `http://localhost:${SERVER_PORT}/feed`,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.some((item) => item.title?.toLowerCase().includes("spam"))).toBe(
				false,
			);
		});

		test("should filter items by multiple include keywords (comma-separated)", async () => {
			const response = await fetch("/filter", {
				method: "GET",
				query: {
					feed: `http://localhost:${SERVER_PORT}/feed`,
					include: "AI,programming",
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.length).toBeGreaterThan(0);
		});

		test("should respect caseSensitive option", async () => {
			const response = await fetch("/filter", {
				method: "GET",
				query: {
					caseSensitive: true,
					feed: `http://localhost:${SERVER_PORT}/feed`,
					include: "ai",
				},
			});

			expect(response.data).toBeDefined();
			// "ai" lowercase should not match "AI" when case sensitive
			expect(response.data?.item?.length).toBe(0);
		});
	});

	describe("/filter - date filtering", () => {
		test("should filter items after a specific date", async () => {
			const response = await fetch("/filter", {
				method: "GET",
				query: {
					after: "2025-01-10",
					feed: `http://localhost:${SERVER_PORT}/feed`,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.length).toBeGreaterThan(0);
			// All items should be after 2025-01-10
			for (const item of response.data?.item ?? []) {
				expect(new Date(item.date as Date).getTime()).toBeGreaterThan(
					new Date("2025-01-10").getTime(),
				);
			}
		});

		test("should filter items before a specific date", async () => {
			const response = await fetch("/filter", {
				method: "GET",
				query: {
					before: "2025-01-10",
					feed: `http://localhost:${SERVER_PORT}/feed`,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.length).toBeGreaterThan(0);
			// All items should be before 2025-01-10
			for (const item of response.data?.item ?? []) {
				expect(new Date(item.date as Date).getTime()).toBeLessThan(
					new Date("2025-01-10").getTime(),
				);
			}
		});

		test("should filter items within a date range", async () => {
			const response = await fetch("/filter", {
				method: "GET",
				query: {
					after: "2025-01-05",
					before: "2025-01-16",
					feed: `http://localhost:${SERVER_PORT}/feed`,
				},
			});

			expect(response.data).toBeDefined();
			// AI Tech (Jan 15), Programming (Jan 10), Spam (Jan 5)
			expect(response.data?.item?.length).toBe(3);
		});
	});

	describe("/filter - author filtering", () => {
		test("should filter items by author include", async () => {
			const response = await fetch("/filter", {
				method: "GET",
				query: {
					author: "John Doe",
					feed: `http://localhost:${SERVER_PORT}/feed`,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.length).toBe(2);
			expect(response.data?.item?.every((item) => item.author?.[0]?.name === "John Doe")).toBe(
				true,
			);
		});

		test("should filter items by author exclude", async () => {
			const response = await fetch("/filter", {
				method: "GET",
				query: {
					authorExclude: "Spam Bot",
					feed: `http://localhost:${SERVER_PORT}/feed`,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.some((item) => item.author?.[0]?.name === "Spam Bot")).toBe(
				false,
			);
		});

		test("should filter items by multiple authors (comma-separated)", async () => {
			const response = await fetch("/filter", {
				method: "GET",
				query: {
					author: "John Doe,Jane Smith",
					feed: `http://localhost:${SERVER_PORT}/feed`,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.length).toBe(4); // All except Spam Bot
		});
	});

	describe("/filter - category filtering", () => {
		test("should filter items by category include", async () => {
			const response = await fetch("/filter", {
				method: "GET",
				query: {
					category: "AI",
					feed: `http://localhost:${SERVER_PORT}/feed`,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.length).toBe(2); // AI Tech and ML Guide
		});

		test("should filter items by category exclude", async () => {
			const response = await fetch("/filter", {
				method: "GET",
				query: {
					categoryExclude: "spam",
					feed: `http://localhost:${SERVER_PORT}/feed`,
				},
			});

			expect(response.data).toBeDefined();
			expect(
				response.data?.item?.some((item) => item.category?.some((cat) => cat.name === "spam")),
			).toBe(false);
		});
	});

	describe("/filter - limit filtering", () => {
		test("should limit number of items from start", async () => {
			const response = await fetch("/filter", {
				method: "GET",
				query: {
					feed: `http://localhost:${SERVER_PORT}/feed`,
					limit: 2,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.length).toBe(2);
		});

		test("should limit number of items from end with fromEnd", async () => {
			const response = await fetch("/filter", {
				method: "GET",
				query: {
					feed: `http://localhost:${SERVER_PORT}/feed`,
					fromEnd: true,
					limit: 2,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.length).toBe(2);
			// fromEnd=true takes last 2 items from the feed (order preserved from original)
			// Feed order: AI Tech, Programming, Spam, ML Guide, Old Article
			// Last 2: ML Guide, Old Article
			expect(response.data?.item?.[0]?.title).toBe("Machine Learning Guide");
			expect(response.data?.item?.[1]?.title).toBe("Old Article");
		});
	});

	describe("/filter - override metadata", () => {
		test("should override feed metadata with JSON string", async () => {
			const overrideData = JSON.stringify({
				description: "Custom description",
				title: "My Filtered Feed",
			});

			const response = await fetch("/filter", {
				method: "GET",
				query: {
					feed: `http://localhost:${SERVER_PORT}/feed`,
					override: overrideData,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.title).toBe("My Filtered Feed");
			expect(response.data?.description).toBe("Custom description");
		});
	});

	describe("/filter - combined filters", () => {
		test("should apply multiple filters together", async () => {
			const response = await fetch("/filter", {
				method: "GET",
				query: {
					author: "John Doe",
					category: "AI",
					feed: `http://localhost:${SERVER_PORT}/feed`,
					limit: 1,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.item?.length).toBe(1);
		});
	});
});
