import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { getCachedBooksData } from "@/books";
import { MemoryCache } from "@/cache";

let server: ReturnType<typeof Bun.serve> | null = null;
let baseUrl = "";

const requestCounts = {
	feedA: 0,
	feedB: 0,
	invalid: 0,
};

let feedA = "";
let feedB = "";
let invalidFeed = "not xml";

function createCache() {
	return new MemoryCache({ defaultMaxAgeMs: 7 * 24 * 60 * 60 * 1000 });
}

function resetFeeds() {
	requestCounts.feedA = 0;
	requestCounts.feedB = 0;
	requestCounts.invalid = 0;

	feedA = createRssFeed("Feed A", [
		{
			category: "Tech",
			date: "Mon, 01 Jan 2025 10:00:00 GMT",
			path: "a-old",
			title: "Old Article",
		},
		{
			category: "News",
			date: "Wed, 03 Jan 2025 10:00:00 GMT",
			path: "a-new",
			title: "New Article",
		},
	]);
	feedB = createRssFeed("Feed B", [
		{
			category: "Books",
			date: "Tue, 02 Jan 2025 10:00:00 GMT",
			path: "b-only",
			title: "Book Article",
		},
	]);
	invalidFeed = "not xml";
}

function createRssFeed(
	title: string,
	items: {
		category: string;
		date: string;
		path: string;
		title: string;
	}[],
) {
	return /* xml */ `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>${title}</title>
		<link>https://example.com/${title.toLowerCase().replaceAll(" ", "-")}</link>
		<description>${title} description</description>
		${items
			.map(
				(item) => `<item>
			<title>${item.title}</title>
			<link>https://example.com/${item.path}</link>
			<description>${item.title} description</description>
			<pubDate>${item.date}</pubDate>
			<category>${item.category}</category>
		</item>`,
			)
			.join("")}
	</channel>
</rss>`;
}

function startServer() {
	const startPort = 13621 + Math.floor(Math.random() * 1000);

	for (let offset = 0; offset < 20; offset += 1) {
		try {
			return Bun.serve({
				port: startPort + offset,
				routes: {
					"/feed-a": () => {
						requestCounts.feedA += 1;
						return new Response(feedA, {
							headers: { "content-type": "application/rss+xml" },
						});
					},
					"/feed-b": () => {
						requestCounts.feedB += 1;
						return new Response(feedB, {
							headers: { "content-type": "application/rss+xml" },
						});
					},
					"/invalid": () => {
						requestCounts.invalid += 1;
						return new Response(invalidFeed, {
							headers: { "content-type": "application/rss+xml" },
						});
					},
				},
			});
		} catch {}
	}

	throw new Error("Failed to start books test feed server");
}

beforeAll(() => {
	resetFeeds();
	server = startServer();
	baseUrl = `http://localhost:${server.port}`;
});

afterAll(() => {
	server?.stop();
});

describe("getCachedBooksData", () => {
	test("fetches, sorts, and extracts categories", async () => {
		resetFeeds();
		const cache = createCache();

		const result = await getCachedBooksData([`${baseUrl}/feed-a`], cache, 10_000);

		expect(result.sortedData.item?.map((item) => item.title)).toEqual([
			"New Article",
			"Old Article",
		]);
		expect(result.categories).toEqual([{ name: "News" }, { name: "Tech" }]);
		expect(requestCounts.feedA).toBe(1);
	});

	test("uses fresh cache before TTL expires", async () => {
		resetFeeds();
		const cache = createCache();

		await getCachedBooksData([`${baseUrl}/feed-a`], cache, 10_000);
		const result = await getCachedBooksData([`${baseUrl}/feed-a`], cache, 10_000);

		expect(result.sortedData.item?.[0]?.title).toBe("New Article");
		expect(requestCounts.feedA).toBe(1);
	});

	test("refreshes fresh cache after TTL expires", async () => {
		resetFeeds();
		const cache = createCache();

		await getCachedBooksData([`${baseUrl}/feed-a`], cache, 20);
		feedA = createRssFeed("Feed A", [
			{
				category: "Updated",
				date: "Fri, 05 Jan 2025 10:00:00 GMT",
				path: "a-updated",
				title: "Updated Article",
			},
		]);
		await new Promise((resolve) => setTimeout(resolve, 40));

		const result = await getCachedBooksData([`${baseUrl}/feed-a`], cache, 20);

		expect(result.sortedData.item?.[0]?.title).toBe("Updated Article");
		expect(result.categories).toEqual([{ name: "Updated" }]);
		expect(requestCounts.feedA).toBe(2);
	});

	test("falls back to last successful data when all configured feeds fail after TTL", async () => {
		resetFeeds();
		const cache = createCache();

		await getCachedBooksData([`${baseUrl}/feed-a`], cache, 20);
		feedA = invalidFeed;
		await new Promise((resolve) => setTimeout(resolve, 40));

		const result = await getCachedBooksData([`${baseUrl}/feed-a`], cache, 20);

		expect(result.sortedData.item?.[0]?.title).toBe("New Article");
		expect(result.categories).toEqual([{ name: "News" }, { name: "Tech" }]);
		expect(requestCounts.feedA).toBe(2);
	});

	test("caches partial data when at least one configured feed succeeds", async () => {
		resetFeeds();
		const cache = createCache();

		const result = await getCachedBooksData(
			[`${baseUrl}/invalid`, `${baseUrl}/feed-b`],
			cache,
			10_000,
		);

		expect(result.sortedData.item?.map((item) => item.title)).toEqual(["Book Article"]);
		expect(result.categories).toEqual([{ name: "Books" }]);
		expect(requestCounts.invalid).toBe(1);
		expect(requestCounts.feedB).toBe(1);
	});

	test("returns empty data when no feeds are configured", async () => {
		resetFeeds();
		const cache = createCache();

		const result = await getCachedBooksData([], cache, 10_000);

		expect(result.sortedData.title).toBe("No title");
		expect(result.sortedData.item).toEqual([]);
		expect(result.categories).toEqual([]);
	});
});
