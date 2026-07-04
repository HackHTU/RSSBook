import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { edenFetch } from "@elysiajs/eden";
import transformApp from "@/routers/utils/transform";
import type { Data } from "@/types";

let server: ReturnType<typeof Bun.serve> | null = null;
const SERVER_PORT = 13584;
const APP_PORT = 13594;

// RSS 2.0 feed
const rssFeed = /* xml */ `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
	<channel>
		<title>RSS Feed</title>
		<link>https://rss.example.com</link>
		<description>A test RSS feed</description>
		<item>
			<title>RSS Article</title>
			<link>https://rss.example.com/article</link>
			<description>Article from RSS feed</description>
			<pubDate>Mon, 15 Jan 2025 10:00:00 GMT</pubDate>
		</item>
	</channel>
</rss>`;

// Atom feed
const atomFeed = /* xml */ `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
	<title>Atom Feed</title>
	<link href="https://atom.example.com"/>
	<subtitle>A test Atom feed</subtitle>
	<updated>2025-01-15T10:00:00Z</updated>
	<entry>
		<title>Atom Article</title>
		<link href="https://atom.example.com/article"/>
		<summary>Article from Atom feed</summary>
		<published>2025-01-15T10:00:00Z</published>
	</entry>
</feed>`;

// Raw JSON data
const rawJson = JSON.stringify({
	description: "A raw JSON feed",
	item: [
		{
			date: new Date("2025-01-15T10:00:00Z"),
			description: "Article from raw JSON",
			link: "https://raw.example.com/article",
			title: "Raw Article",
		},
	],
	link: "https://raw.example.com",
	title: "Raw JSON Feed",
} satisfies Data);

const fetch = edenFetch<typeof transformApp>(`http://localhost:${APP_PORT}`);

beforeAll(() => {
	server = Bun.serve({
		port: SERVER_PORT,
		routes: {
			"/atom": () =>
				new Response(atomFeed, {
					headers: { "content-type": "application/atom+xml" },
				}),
			"/raw": () =>
				new Response(rawJson, {
					headers: { "content-type": "application/json" },
				}),
			"/rss": () =>
				new Response(rssFeed, {
					headers: { "content-type": "application/rss+xml" },
				}),
		},
	});

	transformApp.listen(APP_PORT);
});

afterAll(() => {
	server?.stop();
	transformApp.stop();
});

describe("transformApp", () => {
	describe("/transform - RSS feed", () => {
		test("should transform RSS feed to standard format", async () => {
			const response = await fetch("/transform", {
				method: "GET",
				query: {
					feed: `http://localhost:${SERVER_PORT}/rss`,
					from: "rss",
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.title).toBe("RSS Feed");
			expect(response.data?.link).toBe("https://rss.example.com");
			expect(response.data?.description).toBe("A test RSS feed");
			expect(response.data?.item?.length).toBe(1);
			expect(response.data?.item?.[0]?.title).toBe("RSS Article");
		});
	});

	describe("/transform - Atom feed", () => {
		test("should transform Atom feed to standard format", async () => {
			const response = await fetch("/transform", {
				method: "GET",
				query: {
					feed: `http://localhost:${SERVER_PORT}/atom`,
					from: "atom",
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.title).toBe("Atom Feed");
			expect(response.data?.item?.length).toBe(1);
			expect(response.data?.item?.[0]?.title).toBe("Atom Article");
		});
	});

	describe("/transform - raw JSON", () => {
		test("should transform raw JSON to standard format", async () => {
			const response = await fetch("/transform", {
				method: "GET",
				query: {
					feed: `http://localhost:${SERVER_PORT}/raw`,
					from: "raw",
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.title).toBe("Raw JSON Feed");
			expect(response.data?.link).toBe("https://raw.example.com");
			expect(response.data?.item?.length).toBe(1);
			expect(response.data?.item?.[0]?.title).toBe("Raw Article");
		});
	});

	describe("/transform - feed metadata", () => {
		test("should preserve feed metadata after transformation", async () => {
			const response = await fetch("/transform", {
				method: "GET",
				query: {
					feed: `http://localhost:${SERVER_PORT}/rss`,
					from: "rss",
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.title).toBeDefined();
			expect(response.data?.link).toBeDefined();
		});

		test("should preserve item dates after transformation", async () => {
			const response = await fetch("/transform", {
				method: "GET",
				query: {
					feed: `http://localhost:${SERVER_PORT}/rss`,
					from: "rss",
				},
			});

			expect(response.data?.item?.[0]?.date).toBeDefined();
		});
	});
});
