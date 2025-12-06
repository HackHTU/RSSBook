import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { edenFetch } from "@elysiajs/eden";
import fetchApp from "./fetch";

// Set test environment to skip URL validation for localhost
process.env.NODE_ENV = "test";

let server: ReturnType<typeof Bun.serve> | null = null;
const SERVER_PORT = 13585;
const APP_PORT = 13586;

// Basic HTML page with title and description
const basicHtml = /* html */ `<!DOCTYPE html>
<html>
<head>
	<title>Test Page Title</title>
	<meta name="description" content="Test page description">
	<meta name="author" content="Test Author">
	<link rel="icon" href="/favicon.png">
</head>
<body>
	<h1>Main Heading</h1>
	<p>Some content here</p>
</body>
</html>`;

// HTML page with list items
const listHtml = /* html */ `<!DOCTYPE html>
<html>
<head>
	<title>Blog Posts</title>
	<meta name="description" content="A list of blog posts">
</head>
<body>
	<div class="posts">
		<article class="post">
			<h2><a href="/post/1">First Post</a></h2>
			<p class="description">This is the first post description</p>
			<time datetime="2024-01-15">January 15, 2024</time>
		</article>
		<article class="post">
			<h2><a href="/post/2">Second Post</a></h2>
			<p class="description">This is the second post description</p>
			<time datetime="2024-01-20">January 20, 2024</time>
		</article>
		<article class="post">
			<h2><a href="/post/3">Third Post</a></h2>
			<p class="description">This is the third post description</p>
			<time datetime="2024-01-25">January 25, 2024</time>
		</article>
	</div>
</body>
</html>`;

// HTML page with custom selectors
const customSelectorsHtml = /* html */ `<!DOCTYPE html>
<html>
<head>
	<title>Custom Page</title>
</head>
<body>
	<div class="site-title">Custom Site Title</div>
	<div class="site-description">Custom site description text</div>
	<span class="site-author">Custom Author Name</span>
	<ul class="items">
		<li class="item">
			<span class="item-heading">Item One Title</span>
			<a class="item-url" href="https://example.com/item1">Link</a>
			<span class="item-summary">Item one summary text</span>
			<span class="item-published" datetime="2024-02-01">Feb 1, 2024</span>
		</li>
		<li class="item">
			<span class="item-heading">Item Two Title</span>
			<a class="item-url" href="https://example.com/item2">Link</a>
			<span class="item-summary">Item two summary text</span>
			<span class="item-published" datetime="2024-02-05">Feb 5, 2024</span>
		</li>
	</ul>
</body>
</html>`;

// HTML with og:title meta tag
const ogTitleHtml = /* html */ `<!DOCTYPE html>
<html>
<head>
	<meta property="og:title" content="OG Title">
	<meta property="og:description" content="OG Description">
</head>
<body>
	<p>Content</p>
</body>
</html>`;

// Minimal HTML
const minimalHtml = /* html */ `<!DOCTYPE html>
<html>
<head></head>
<body><p>Just some text</p></body>
</html>`;

// HTML with article content
const articleHtml = /* html */ `<!DOCTYPE html>
<html>
<head>
	<title>Articles Page</title>
</head>
<body>
	<div class="articles">
		<div class="entry">
			<h3>Article Title</h3>
			<a href="/article/1">Read more</a>
			<article><p>This is the full article content with <strong>HTML</strong> tags.</p></article>
			<time datetime="2024-03-10">March 10, 2024</time>
		</div>
	</div>
</body>
</html>`;

// HTML with shortcut icon
const shortcutIconHtml = /* html */ `<!DOCTYPE html>
<html>
<head>
	<title>Shortcut Icon Page</title>
	<link rel="shortcut icon" href="/shortcut-icon.ico">
</head>
<body><p>Content</p></body>
</html>`;

const fetch = edenFetch<typeof fetchApp>(`http://localhost:${APP_PORT}`);

beforeAll(() => {
	server = Bun.serve({
		port: SERVER_PORT,
		routes: {
			"/article": () =>
				new Response(articleHtml, {
					headers: { "content-type": "text/html" },
				}),
			"/basic": () =>
				new Response(basicHtml, {
					headers: { "content-type": "text/html" },
				}),
			"/custom": () =>
				new Response(customSelectorsHtml, {
					headers: { "content-type": "text/html" },
				}),
			"/list": () =>
				new Response(listHtml, {
					headers: { "content-type": "text/html" },
				}),
			"/minimal": () =>
				new Response(minimalHtml, {
					headers: { "content-type": "text/html" },
				}),
			"/og": () =>
				new Response(ogTitleHtml, {
					headers: { "content-type": "text/html" },
				}),
			"/shortcut-icon": () =>
				new Response(shortcutIconHtml, {
					headers: { "content-type": "text/html" },
				}),
		},
	});

	fetchApp.listen(APP_PORT);
});

afterAll(() => {
	server?.stop();
	fetchApp.stop();
});

describe("fetchApp", () => {
	describe("/fetch/html - basic metadata extraction", () => {
		test("should extract title from <title> tag", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: `http://localhost:${SERVER_PORT}/basic`,
				},
			});

			expect(response.data).toBeDefined();
			expect(response.data?.title).toBe("Test Page Title");
		});

		test("should extract description from meta tag", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: `http://localhost:${SERVER_PORT}/basic`,
				},
			});

			expect(response.data?.description).toBe("Test page description");
		});

		test("should extract author from meta tag", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: `http://localhost:${SERVER_PORT}/basic`,
				},
			});

			expect(response.data?.author).toEqual({ name: "Test Author" });
		});

		test("should extract favicon", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: `http://localhost:${SERVER_PORT}/basic`,
				},
			});

			expect(response.data?.favicon).toBe(`http://localhost:${SERVER_PORT}/favicon.png`);
		});

		test("should set link to the fetched URL", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: `http://localhost:${SERVER_PORT}/basic`,
				},
			});

			expect(response.data?.link).toBe(`http://localhost:${SERVER_PORT}/basic`);
		});
	});

	describe("/fetch/html - fallback title extraction", () => {
		test("should fallback to og:title when no title tag", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: `http://localhost:${SERVER_PORT}/og`,
				},
			});

			expect(response.data?.title).toBe("OG Title");
			expect(response.data?.description).toBe("OG Description");
		});

		test("should return 'No title' when no title found", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: `http://localhost:${SERVER_PORT}/minimal`,
				},
			});

			expect(response.data?.title).toBe("No title");
		});
	});

	describe("/fetch/html - item extraction", () => {
		test("should extract items with item selector", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					item: ".post",
					url: `http://localhost:${SERVER_PORT}/list`,
				},
			});

			expect(response.data?.item).toBeDefined();
			expect(response.data?.item?.length).toBe(3);
		});

		test("should extract item titles", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					item: ".post",
					url: `http://localhost:${SERVER_PORT}/list`,
				},
			});

			const items = response.data?.item;
			expect(items?.[0]?.title).toBe("First Post");
			expect(items?.[1]?.title).toBe("Second Post");
			expect(items?.[2]?.title).toBe("Third Post");
		});

		test("should extract item links and make them absolute", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					item: ".post",
					url: `http://localhost:${SERVER_PORT}/list`,
				},
			});

			const items = response.data?.item;
			expect(items?.[0]?.link).toBe(`http://localhost:${SERVER_PORT}/post/1`);
			expect(items?.[1]?.link).toBe(`http://localhost:${SERVER_PORT}/post/2`);
			expect(items?.[2]?.link).toBe(`http://localhost:${SERVER_PORT}/post/3`);
		});

		test("should extract item descriptions", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					item: ".post",
					"item-description": ".description",
					url: `http://localhost:${SERVER_PORT}/list`,
				},
			});

			const items = response.data?.item;
			expect(items?.[0]?.description).toBe("This is the first post description");
			expect(items?.[1]?.description).toBe("This is the second post description");
		});

		test("should extract item dates from datetime attribute", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					item: ".post",
					url: `http://localhost:${SERVER_PORT}/list`,
				},
			});

			const items = response.data?.item;
			// Date comes as ISO string from JSON response
			const dateStr = items?.[0]?.date;
			expect(dateStr).toBeDefined();
			expect(new Date(dateStr as unknown as string).getFullYear()).toBe(2024);
		});
	});

	describe("/fetch/html - custom selectors", () => {
		test("should use custom title selector", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					title: ".site-title",
					url: `http://localhost:${SERVER_PORT}/custom`,
				},
			});

			expect(response.data?.title).toBe("Custom Site Title");
		});

		test("should use custom description selector", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					description: ".site-description",
					url: `http://localhost:${SERVER_PORT}/custom`,
				},
			});

			expect(response.data?.description).toBe("Custom site description text");
		});

		test("should use custom author selector", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					author: ".site-author",
					url: `http://localhost:${SERVER_PORT}/custom`,
				},
			});

			expect(response.data?.author).toEqual({ name: "Custom Author Name" });
		});

		test("should use custom item-title selector", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					item: ".item",
					"item-title": ".item-heading",
					url: `http://localhost:${SERVER_PORT}/custom`,
				},
			});

			const items = response.data?.item;
			expect(items?.[0]?.title).toBe("Item One Title");
			expect(items?.[1]?.title).toBe("Item Two Title");
		});

		test("should use custom item-link selector", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					item: ".item",
					"item-link": ".item-url",
					url: `http://localhost:${SERVER_PORT}/custom`,
				},
			});

			const items = response.data?.item;
			expect(items?.[0]?.link).toBe("https://example.com/item1");
			expect(items?.[1]?.link).toBe("https://example.com/item2");
		});

		test("should use custom item-description selector", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					item: ".item",
					"item-description": ".item-summary",
					url: `http://localhost:${SERVER_PORT}/custom`,
				},
			});

			const items = response.data?.item;
			expect(items?.[0]?.description).toBe("Item one summary text");
			expect(items?.[1]?.description).toBe("Item two summary text");
		});
	});

	describe("/fetch/html - article content extraction", () => {
		test("should extract article content", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					item: ".entry",
					url: `http://localhost:${SERVER_PORT}/article`,
				},
			});

			const items = response.data?.item;
			expect(items?.[0]?.content).toBeDefined();
			expect(items?.[0]?.content).toContain("full article content");
		});
	});

	describe("/fetch/html - favicon fallbacks", () => {
		test("should use shortcut icon when available", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: `http://localhost:${SERVER_PORT}/shortcut-icon`,
				},
			});

			expect(response.data?.favicon).toBe(`http://localhost:${SERVER_PORT}/shortcut-icon.ico`);
		});

		test("should fallback to /favicon.ico when no icon link", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: `http://localhost:${SERVER_PORT}/minimal`,
				},
			});

			expect(response.data?.favicon).toBe(`http://localhost:${SERVER_PORT}/favicon.ico`);
		});
	});

	describe("/fetch/html - empty items handling", () => {
		test("should return undefined items when no item selector provided", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: `http://localhost:${SERVER_PORT}/basic`,
				},
			});

			expect(response.data?.item).toBeUndefined();
		});

		test("should return undefined items when selector matches nothing", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					item: ".nonexistent-class",
					url: `http://localhost:${SERVER_PORT}/basic`,
				},
			});

			expect(response.data?.item).toBeUndefined();
		});
	});

	describe("/fetch/html - item ID generation", () => {
		test("should generate unique IDs for items", async () => {
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					item: ".post",
					url: `http://localhost:${SERVER_PORT}/list`,
				},
			});

			const items = response.data?.item;
			expect(items?.[0]?.id).toBeDefined();
			expect(items?.[1]?.id).toBeDefined();
			expect(items?.[0]?.id).not.toBe(items?.[1]?.id);
		});
	});

	describe("/fetch/html - URL validation", () => {
		// Temporarily disable test mode for validation tests
		const originalEnv = process.env.NODE_ENV;

		test("should reject invalid URL format", async () => {
			process.env.NODE_ENV = "production";
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: "not-a-valid-url",
				},
			});
			process.env.NODE_ENV = originalEnv;

			expect(response.error).toBeDefined();
		});

		test("should reject non-http/https protocols", async () => {
			process.env.NODE_ENV = "production";
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: "ftp://example.com/file",
				},
			});
			process.env.NODE_ENV = originalEnv;

			expect(response.error).toBeDefined();
		});

		test("should reject localhost", async () => {
			process.env.NODE_ENV = "production";
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: "http://localhost:8080/test",
				},
			});
			process.env.NODE_ENV = originalEnv;

			expect(response.error).toBeDefined();
		});

		test("should reject 127.0.0.1", async () => {
			process.env.NODE_ENV = "production";
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: "http://127.0.0.1:8080/test",
				},
			});
			process.env.NODE_ENV = originalEnv;

			expect(response.error).toBeDefined();
		});

		test("should reject IPv4 addresses", async () => {
			process.env.NODE_ENV = "production";
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: "http://192.168.1.1/test",
				},
			});
			process.env.NODE_ENV = originalEnv;

			expect(response.error).toBeDefined();
		});

		test("should reject private network addresses (10.x.x.x)", async () => {
			process.env.NODE_ENV = "production";
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: "http://10.0.0.1/test",
				},
			});
			process.env.NODE_ENV = originalEnv;

			expect(response.error).toBeDefined();
		});

		test("should reject .local domains", async () => {
			process.env.NODE_ENV = "production";
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: "http://myserver.local/test",
				},
			});
			process.env.NODE_ENV = originalEnv;

			expect(response.error).toBeDefined();
		});

		test("should reject single-word hostnames without TLD", async () => {
			process.env.NODE_ENV = "production";
			const response = await fetch("/fetch/html", {
				method: "GET",
				query: {
					url: "http://intranet/test",
				},
			});
			process.env.NODE_ENV = originalEnv;

			expect(response.error).toBeDefined();
		});
	});
});
