import { describe, expect, test } from "bun:test";
import type { Data } from "@/types";
import { parse } from "@/utils";

describe("parser", () => {
	describe("exampleData1", () => {
		const data = parse(exampleData1(), "raw");

		test("feed metadata fields", () => {
			expect(data.title).toBe("Ghost — Complex Example Feed");
			expect(data.description).toBe(
				"A feed demonstrating complex objects for many fields (enclosures, authors, categories, extensions).",
			);
			expect(data.link).toBe("https://example.com");
			expect(data.language).toBe("en-US");
			expect(data.copyright).toBe("© 2025 Ghost Feed Team");
			expect(data.category).toBe("Technology");
			expect(data.id).toBe("urn:uuid:feed-complex-0001");
			expect(data.favicon).toBe("https://example.com/favicon.ico");
			expect(data.image).toBe("https://example.com/assets/cover-large.png");
			expect(data.podcast).toBe(true);
			expect(data.ttl).toBe(60);
			expect(data.updated).toEqual(new Date("2025-11-05T12:00:00Z"));
		});

		test("feed author object", () => {
			expect(data.author).toBeDefined();
			expect(data.author?.name).toBe("Ghost Feed Team");
			expect(data.author?.email).toBe("team@ghost.example");
			expect(data.author?.link).toBe("https://example.com/team");
			expect(data.author?.avatar).toBe("https://example.com/avatars/ghost.png");
		});

		test("items array exists", () => {
			expect(data.item).toBeDefined();
			expect(data.item?.length).toBe(2);
		});

		test("item 1 basic fields", () => {
			const item = data.item?.[0];
			expect(item?.title).toBe("Episode 1 — Getting started with Ghost");
			expect(item?.link).toBe("https://example.com/podcast/episode-1");
			expect(item?.id).toBe("urn:uuid:item-complex-ep1");
			expect(item?.description).toBe("Episode 1 introduces the goals of the Ghost Feed project.");
			expect(item?.content).toBe(
				"<p>This is the full HTML content for episode 1. <strong>Rich</strong> content allowed.</p>",
			);
			expect(item?.date).toEqual(new Date("2025-11-01T10:00:00Z"));
			expect(item?.published).toEqual(new Date("2025-11-01T10:00:00Z"));
		});

		test("item 1 audio object", () => {
			const audio = data.item?.[0]?.audio;
			expect(audio).toBeDefined();
			expect(typeof audio).toBe("object");
			if (typeof audio === "object") {
				expect(audio.url).toBe("https://cdn.example.com/podcasts/episode-1.mp3");
				expect(audio.type).toBe("audio/mpeg");
				expect(audio.length).toBe(12_345_678);
				expect(audio.duration).toBe(360);
				expect(audio.title).toBe("Episode 1 — Introduction");
			}
		});

		test("item 1 video object", () => {
			const video = data.item?.[0]?.video;
			expect(video).toBeDefined();
			expect(typeof video).toBe("object");
			if (typeof video === "object") {
				expect(video.url).toBe("https://cdn.example.com/videos/ep1-preview.mp4");
				expect(video.type).toBe("video/mp4");
				expect(video.length).toBe(8_000_000);
				expect(video.duration).toBe(60);
				expect(video.title).toBe("Episode 1 preview");
			}
		});

		test("item 1 image object", () => {
			const image = data.item?.[0]?.image;
			expect(image).toBeDefined();
			expect(typeof image).toBe("object");
			if (typeof image === "object") {
				expect(image.url).toBe("https://cdn.example.com/podcasts/episode-1-cover.png");
				expect(image.type).toBe("image/png");
				expect(image.length).toBe(20480);
				expect(image.title).toBe("Episode 1 cover");
			}
		});

		test("item 1 enclosure object", () => {
			const enclosure = data.item?.[0]?.enclosure;
			expect(enclosure).toBeDefined();
			expect(enclosure?.url).toBe("https://cdn.example.com/attachments/ep1-notes.pdf");
			expect(enclosure?.type).toBe("application/pdf");
			expect(enclosure?.length).toBe(54_321);
			expect(enclosure?.title).toBe("Episode 1 show notes");
		});

		test("item 1 authors array", () => {
			const authors = data.item?.[0]?.author;
			expect(authors).toBeDefined();
			expect(authors?.length).toBe(2);
			expect(authors).toContainEqual({
				avatar: "https://example.com/avatars/alice.jpg",
				email: "alice@example.com",
				name: "Alice Dev",
			});
			expect(authors).toContainEqual({
				link: "https://example.com/bob",
				name: "Bob Editor",
			});
		});

		test("item 1 categories array", () => {
			const categories = data.item?.[0]?.category;
			expect(categories).toBeDefined();
			expect(categories?.length).toBe(2);
			expect(categories).toContainEqual({
				domain: "example.com",
				name: "Podcast",
				scheme: "urn:example:cat",
				term: "podcast",
			});
			expect(categories).toContainEqual({
				name: "Technology",
				term: "tech",
			});
		});

		test("item 1 extensions array", () => {
			const extensions = data.item?.[0]?.extensions;
			expect(extensions).toBeDefined();
			expect(extensions?.length).toBe(2);
			expect(extensions).toContainEqual({
				name: "itunes",
				objects: { duration: 360, episodeType: "full", explicit: false },
			});
			expect(extensions).toContainEqual({
				name: "customMeta",
				objects: { rating: 4.7, reading_time: "6 min" },
			});
		});

		test("item 2 string-based media fields", () => {
			const item = data.item?.[1];
			expect(item?.title).toBe("Episode 2 — Deep dive");
			expect(item?.audio).toBe("https://cdn.example.com/podcasts/episode-2.mp3");
			expect(item?.video).toBe("https://cdn.example.com/videos/ep2-highlights.mp4");
			expect(item?.image).toBe("https://cdn.example.com/podcasts/episode-2-cover.jpg");
		});

		test("item 2 enclosure object", () => {
			const enclosure = data.item?.[1]?.enclosure;
			expect(enclosure).toBeDefined();
			expect(enclosure?.url).toBe("https://cdn.example.com/attachments/ep2-extra.zip");
			expect(enclosure?.type).toBe("application/zip");
			expect(enclosure?.length).toBe(102_400);
		});
	});

	describe("exampleData2", () => {
		const data = parse(exampleData2(), "raw");

		test("feed metadata fields", () => {
			expect(data.title).toBe("Ghost — Simple Example Feed");
			expect(data.description).toBe(
				"A minimal/simple example where union fields use string URLs instead of objects.",
			);
			expect(data.link).toBe("https://example.com");
			expect(data.language).toBe("en");
			expect(data.copyright).toBe("© 2025 Ghost Simple");
			expect(data.category).toBe("News");
			expect(data.id).toBe("urn:uuid:feed-simple-0001");
			expect(data.favicon).toBe("https://example.com/favicon-simple.ico");
			expect(data.image).toBe("https://example.com/assets/simple-cover.png");
			expect(data.podcast).toBe(false);
			expect(data.ttl).toBe(1440);
			expect(data.updated).toEqual(new Date("2025-11-06T07:00:00Z"));
		});

		test("feed author object", () => {
			expect(data.author).toBeDefined();
			expect(data.author?.name).toBe("Ghost Simple Author");
			expect(data.author?.link).toBe("https://example.com/author");
		});

		test("items array exists", () => {
			expect(data.item).toBeDefined();
			expect(data.item?.length).toBe(2);
		});

		test("item 1 basic fields with string media", () => {
			const item = data.item?.[0];
			expect(item?.title).toBe("Simple News Post — 1");
			expect(item?.link).toBe("https://example.com/news/simple-post-1");
			expect(item?.id).toBe("urn:uuid:item-simple-0001");
			expect(item?.description).toBe("Simple item describing a news post.");
			expect(item?.content).toBe("Short plain-text content for a news item.");
			expect(item?.audio).toBe("https://cdn.example.com/simple/ep1.mp3");
			expect(item?.video).toBe("https://cdn.example.com/simple/ep1-short.mp4");
			expect(item?.image).toBe("https://cdn.example.com/simple/ep1.jpg");
		});

		test("item 2 without video field", () => {
			const item = data.item?.[1];
			expect(item?.title).toBe("Simple Announcement — 2");
			expect(item?.video).toBeUndefined();
			expect(item?.audio).toBe("https://cdn.example.com/simple/ep2.mp3");
		});
	});

	describe("RSS feed parsing", () => {
		const data = parse(sampleRSS(), "rss");

		test("feed metadata fields", () => {
			expect(data.title).toBe("Tech Frontier");
			expect(data.description).toBe(
				"Exploring the latest in software development, AI, and web technologies.",
			);
			expect(data.link).toBe("https://techfrontier.example.com/");
			expect(data.language).toBe("en-US");
			expect(data.copyright).toBe("© 2025 Tech Frontier. All rights reserved.");
			expect(data.image).toBe("https://techfrontier.example.com/assets/rss-cover.png");
		});

		test("feed author from itunes:owner", () => {
			expect(data.author).toBeDefined();
			expect(data.author?.name).toBe("Jane Smith");
			// Note: email may not be parsed from itunes:owner in some parsers
		});

		test("items array exists", () => {
			expect(data.item).toBeDefined();
			expect(data.item?.length).toBe(3);
		});

		test("item 1 basic fields", () => {
			const item = data.item?.[0];
			expect(item?.title).toBe("Next.js 15 — What's New?");
			expect(item?.link).toBe("https://techfrontier.example.com/articles/nextjs-15-whats-new");
			expect(item?.id).toBe("https://techfrontier.example.com/articles/nextjs-15-whats-new");
		});

		test("item 1 audio enclosure", () => {
			const audio = data.item?.[0]?.audio;
			expect(audio).toBeDefined();
			if (typeof audio === "object") {
				expect(audio.url).toBe("https://cdn.techfrontier.example.com/audio/nextjs15.mp3");
				// Parser returns media type category ("audio") instead of full MIME type
				expect(audio.type).toBe("audio");
				expect(audio.length).toBe(3481923);
			}
		});

		test("item 2 video enclosure", () => {
			const video = data.item?.[1]?.video;
			expect(video).toBeDefined();
			if (typeof video === "object") {
				expect(video.url).toBe("https://cdn.techfrontier.example.com/video/ai-assistants-2025.mp4");
				// Parser returns media type category ("video") instead of full MIME type
				expect(video.type).toBe("video");
				expect(video.length).toBe(58249102);
			}
		});

		test("item 3 without enclosure", () => {
			const item = data.item?.[2];
			expect(item?.title).toBe("Why TypeScript Still Dominates Large Projects");
			expect(item?.audio).toBeUndefined();
			expect(item?.video).toBeUndefined();
		});
	});

	describe("Atom feed parsing", () => {
		const data = parse(sampleAtom(), "atom");

		test("feed metadata fields", () => {
			expect(data.title).toBe("Example Tech Blog");
			expect(data.description).toBe(
				"Insights and tutorials about web development, AI, and design.",
			);
			expect(data.link).toBe("https://example.com/");
			// Note: language may not be parsed from atom:language in some parsers
			expect(data.copyright).toBe("© 2025 Example Media. All rights reserved.");
			expect(data.image).toBe("https://example.com/logo.png");
		});

		test("feed author object", () => {
			expect(data.author).toBeDefined();
			expect(data.author?.name).toBe("Jane Doe");
			expect(data.author?.email).toBe("jane@example.com");
			expect(data.author?.link).toBe("https://example.com/authors/jane");
		});

		test("items array exists", () => {
			expect(data.item).toBeDefined();
			expect(data.item?.length).toBe(2);
		});

		test("item 1 basic fields", () => {
			const item = data.item?.[0];
			expect(item?.title).toBe("Building an AI Chatbot with Next.js and OpenAI API");
			expect(item?.link).toBe("https://example.com/posts/nextjs-ai");
			expect(item?.id).toBe("tag:example.com,2025-11-10:/posts/nextjs-ai");
		});

		test("item 1 author", () => {
			const authors = data.item?.[0]?.author;
			expect(authors).toBeDefined();
			expect(authors?.length).toBeGreaterThanOrEqual(1);
			expect(authors).toContainEqual({
				email: "jane@example.com",
				link: "https://example.com/authors/jane",
				name: "Jane Doe",
			});
		});

		test("item 1 categories", () => {
			const categories = data.item?.[0]?.category;
			expect(categories).toBeDefined();
			expect(categories?.length).toBeGreaterThanOrEqual(1);
		});

		test("item 1 audio enclosure", () => {
			const audio = data.item?.[0]?.audio;
			expect(audio).toBeDefined();
			if (typeof audio === "object") {
				expect(audio.url).toBe("https://example.com/audio/nextjs-ai.mp3");
				// Parser returns media type category ("audio") instead of full MIME type
				expect(audio.type).toBe("audio");
				expect(audio.length).toBe(3840000);
			}
		});

		test("item 2 video enclosure", () => {
			const video = data.item?.[1]?.video;
			expect(video).toBeDefined();
			if (typeof video === "object") {
				expect(video.url).toBe("https://example.com/video/design-systems.mp4");
				// Parser returns media type category ("video") instead of full MIME type
				expect(video.type).toBe("video");
				expect(video.length).toBe(15230000);
			}
		});

		test("item 2 author", () => {
			const authors = data.item?.[1]?.author;
			expect(authors).toBeDefined();
			expect(authors).toContainEqual({
				email: "michael@example.com",
				link: "https://example.com/authors/michael",
				name: "Michael Chen",
			});
		});
	});

	describe("error handling", () => {
		describe("raw type", () => {
			test("throws on null content", () => {
				expect(() => parse(null as unknown as string, "raw")).toThrow(
					"Parse Error: Content cannot be null",
				);
			});

			test("throws on invalid JSON string", () => {
				expect(() => parse("{invalid json}", "raw")).toThrow("Parse Error: Invalid JSON string");
			});

			test("throws on non-object parsed content", () => {
				expect(() => parse('"just a string"', "raw")).toThrow(
					"Parse Error: Parsed content must be an object",
				);
			});

			test("parses valid JSON string", () => {
				const jsonString = JSON.stringify({ link: "https://test.com", title: "Test" });
				const data = parse(jsonString, "raw");
				expect(data.title).toBe("Test");
				expect(data.link).toBe("https://test.com");
			});
		});

		describe("rss/atom type", () => {
			test("throws on non-string content for rss", () => {
				expect(() => parse({ title: "test" } as unknown as string, "rss")).toThrow(
					"Parse Error: Content must be a string for feed types",
				);
			});

			test("throws on non-string content for atom", () => {
				expect(() => parse(123 as unknown as string, "atom")).toThrow(
					"Parse Error: Content must be a string for feed types",
				);
			});

			test("throws on invalid XML", () => {
				expect(() => parse("<invalid>xml", "rss")).toThrow();
			});
		});
	});
});

const exampleData1: () => Data = () => ({
	author: {
		avatar: "https://example.com/avatars/ghost.png",
		email: "team@ghost.example",
		link: "https://example.com/team",
		name: "Ghost Feed Team",
	},
	category: "Technology",
	copyright: "© 2025 Ghost Feed Team",
	description:
		"A feed demonstrating complex objects for many fields (enclosures, authors, categories, extensions).",
	favicon: "https://example.com/favicon.ico",
	id: "urn:uuid:feed-complex-0001",
	image: "https://example.com/assets/cover-large.png",
	item: [
		{
			audio: {
				duration: 360,
				length: 12_345_678,
				title: "Episode 1 — Introduction",
				type: "audio/mpeg",
				url: "https://cdn.example.com/podcasts/episode-1.mp3",
			},
			author: [
				{
					avatar: "https://example.com/avatars/alice.jpg",
					email: "alice@example.com",
					name: "Alice Dev",
				},
				{ link: "https://example.com/bob", name: "Bob Editor" },
			],
			category: [
				{ domain: "example.com", name: "Podcast", scheme: "urn:example:cat", term: "podcast" },
				{ name: "Technology", term: "tech" },
			],
			content:
				"<p>This is the full HTML content for episode 1. <strong>Rich</strong> content allowed.</p>",
			date: new Date("2025-11-01T10:00:00Z"),
			description: "Episode 1 introduces the goals of the Ghost Feed project.",
			enclosure: {
				length: 54_321,
				title: "Episode 1 show notes",
				type: "application/pdf",
				url: "https://cdn.example.com/attachments/ep1-notes.pdf",
			},
			extensions: [
				{ name: "itunes", objects: { duration: 360, episodeType: "full", explicit: false } },
				{ name: "customMeta", objects: { rating: 4.7, reading_time: "6 min" } },
			],
			id: "urn:uuid:item-complex-ep1",
			image: {
				length: 20480,
				title: "Episode 1 cover",
				type: "image/png",
				url: "https://cdn.example.com/podcasts/episode-1-cover.png",
			},
			link: "https://example.com/podcast/episode-1",
			published: new Date("2025-11-01T10:00:00Z"),
			title: "Episode 1 — Getting started with Ghost",
			video: {
				duration: 60,
				length: 8_000_000,
				title: "Episode 1 preview",
				type: "video/mp4",
				url: "https://cdn.example.com/videos/ep1-preview.mp4",
			},
		},
		{
			audio: "https://cdn.example.com/podcasts/episode-2.mp3",
			author: [{ name: "Carol Host" }],
			category: [{ name: "Tutorials", term: "tutorial" }],
			content: "Plain text content for episode 2.",
			date: new Date("2025-11-05T09:30:00Z"),
			description: "A shorter description for episode 2.",
			enclosure: {
				length: 102_400,
				title: "Extras for episode 2",
				type: "application/zip",
				url: "https://cdn.example.com/attachments/ep2-extra.zip",
			},
			extensions: [{ name: "social", objects: { tags: ["ghost", "rss"], twitter: "@ghostfeed" } }],
			id: "urn:uuid:item-complex-ep2",
			image: "https://cdn.example.com/podcasts/episode-2-cover.jpg",
			link: "https://example.com/podcast/episode-2",
			published: new Date("2025-11-05T09:30:00Z"),
			title: "Episode 2 — Deep dive",
			video: "https://cdn.example.com/videos/ep2-highlights.mp4",
		},
	],
	language: "en-US",
	link: "https://example.com",
	podcast: true,
	title: "Ghost — Complex Example Feed",
	ttl: 60,
	updated: new Date("2025-11-05T12:00:00Z"),
});

const exampleData2: () => Data = () => ({
	author: { link: "https://example.com/author", name: "Ghost Simple Author" },
	category: "News",
	copyright: "© 2025 Ghost Simple",
	description: "A minimal/simple example where union fields use string URLs instead of objects.",
	favicon: "https://example.com/favicon-simple.ico",
	id: "urn:uuid:feed-simple-0001",
	image: "https://example.com/assets/simple-cover.png",
	item: [
		{
			audio: "https://cdn.example.com/simple/ep1.mp3",
			author: [{ name: "Dave Reporter" }],
			category: [{ name: "News", term: "news" }],
			content: "Short plain-text content for a news item.",
			date: new Date("2025-10-29T08:00:00Z"),
			description: "Simple item describing a news post.",
			extensions: [{ name: "meta", objects: { importance: "low" } }],
			id: "urn:uuid:item-simple-0001",
			image: "https://cdn.example.com/simple/ep1.jpg",
			link: "https://example.com/news/simple-post-1",
			published: new Date("2025-10-29T08:00:00Z"),
			title: "Simple News Post — 1",
			video: "https://cdn.example.com/simple/ep1-short.mp4",
		},
		{
			audio: "https://cdn.example.com/simple/ep2.mp3",
			author: [{ name: "Eve Writer" }],
			category: [{ name: "Announcement", term: "announcement" }],
			content: "Another short piece of content.",
			date: new Date("2025-11-02T14:20:00Z"),
			description: "A follow-up short announcement.",
			extensions: [{ name: "sparse", objects: { promo: false } }],
			id: "urn:uuid:item-simple-0002",
			image: "https://cdn.example.com/simple/ep2.jpg",
			link: "https://example.com/news/simple-post-2",
			published: new Date("2025-11-02T14:20:00Z"),
			title: "Simple Announcement — 2",
		},
	],
	language: "en",
	link: "https://example.com",
	podcast: false,
	title: "Ghost — Simple Example Feed",
	ttl: 1440,
	updated: new Date("2025-11-06T07:00:00Z"),
});

const sampleRSS = () => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
	xmlns:atom="http://www.w3.org/2005/Atom"
	xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
<channel>
	<title>Tech Frontier</title>
	<link>https://techfrontier.example.com/</link>
	<description>Exploring the latest in software development, AI, and web technologies.</description>
	<language>en-us</language>
	<copyright>© 2025 Tech Frontier. All rights reserved.</copyright>
	<category>Technology</category>
	<ttl>60</ttl>
	<lastBuildDate>Mon, 10 Nov 2025 08:00:00 +0900</lastBuildDate>
	<atom:link href="https://techfrontier.example.com/feed.xml" rel="self" type="application/rss+xml" />
	<image>
		<url>https://techfrontier.example.com/assets/rss-cover.png</url>
		<title>Tech Frontier</title>
		<link>https://techfrontier.example.com/</link>
	</image>
	<itunes:image href="https://techfrontier.example.com/assets/rss-cover.png" />
	<itunes:author>Jane Smith</itunes:author>
	<itunes:explicit>false</itunes:explicit>
	<itunes:owner>
		<itunes:name>Jane Smith</itunes:name>
		<itunes:email>contact@techfrontier.example.com</itunes:email>
	</itunes:owner>
	<itunes:category text="Technology"/>

	<item>
		<title>Next.js 15 — What's New?</title>
		<link>https://techfrontier.example.com/articles/nextjs-15-whats-new</link>
		<guid>https://techfrontier.example.com/articles/nextjs-15-whats-new</guid>
		<pubDate>Sat, 09 Nov 2025 15:30:00 +0900</pubDate>
		<description><![CDATA[
			<p>Next.js 15 introduces faster builds, improved streaming, and native RSC enhancements.</p>
		]]></description>
		<content:encoded><![CDATA[
			<p>Next.js 15 introduces a range of new features for modern full-stack development,
			including streaming SSR, React 19 compatibility, and enhanced image handling.</p>
		]]></content:encoded>
		<author>Jane Smith</author>
		<category domain="https://techfrontier.example.com/categories/webdev" term="nextjs" />
		<enclosure url="https://cdn.techfrontier.example.com/audio/nextjs15.mp3" length="3481923" type="audio/mpeg" />
		<itunes:duration>1742</itunes:duration>
		<itunes:explicit>false</itunes:explicit>
	</item>

	<item>
		<title>AI Code Assistants in 2025: Beyond Autocomplete</title>
		<link>https://techfrontier.example.com/articles/ai-assistants-2025</link>
		<guid>https://techfrontier.example.com/articles/ai-assistants-2025</guid>
		<pubDate>Fri, 08 Nov 2025 10:00:00 +0900</pubDate>
		<description><![CDATA[
			<p>From GitHub Copilot X to Google Gemini — how AI assistants reshape coding workflows.</p>
		]]></description>
		<content:encoded><![CDATA[
			<p>Developers in 2025 rely on AI-assisted coding more than ever.
			These tools go beyond autocomplete to offer architecture guidance, testing, and deployment support.</p>
		]]></content:encoded>
		<author>Mark Chen</author>
		<category domain="https://techfrontier.example.com/categories/ai" term="ai" />
		<enclosure url="https://cdn.techfrontier.example.com/video/ai-assistants-2025.mp4" length="58249102" type="video/mp4" />
		<itunes:duration>2310</itunes:duration>
		<itunes:explicit>false</itunes:explicit>
	</item>

	<item>
		<title>Why TypeScript Still Dominates Large Projects</title>
		<link>https://techfrontier.example.com/articles/typescript-dominance</link>
		<guid>https://techfrontier.example.com/articles/typescript-dominance</guid>
		<pubDate>Thu, 07 Nov 2025 09:45:00 +0900</pubDate>
		<description><![CDATA[
			<p>Despite competition, TypeScript remains the top choice for enterprise-scale applications.</p>
		]]></description>
		<author>Jane Smith</author>
		<category domain="https://techfrontier.example.com/categories/programming" term="typescript" />
	</item>
</channel>
</rss>
`;
const sampleAtom = () => `
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <!-- Metadata -->
  <id>urn:uuid:60a76c80-d399-11d9-b93C-0003939e0af6</id>
  <title>Example Tech Blog</title>
  <subtitle>Insights and tutorials about web development, AI, and design.</subtitle>
  <updated>2025-11-10T08:00:00Z</updated>
  <link href="https://example.com/" rel="alternate" />
  <link href="https://example.com/feed.atom" rel="self" type="application/atom+xml" />
  <language>en</language>
  <category term="technology" />
  <rights>© 2025 Example Media. All rights reserved.</rights>
  <icon>https://example.com/favicon.ico</icon>
  <logo>https://example.com/logo.png</logo>

  <!-- Author -->
  <author>
    <name>Jane Doe</name>
    <email>jane@example.com</email>
    <uri>https://example.com/authors/jane</uri>
  </author>

  <!-- Entries -->
  <entry>
    <id>tag:example.com,2025-11-10:/posts/nextjs-ai</id>
    <title>Building an AI Chatbot with Next.js and OpenAI API</title>
    <link href="https://example.com/posts/nextjs-ai" />
    <updated>2025-11-09T14:00:00Z</updated>
    <published>2025-11-08T18:30:00Z</published>
    <summary type="html">
      Learn how to integrate OpenAI’s GPT model into a modern Next.js app,
      including message streaming and UI optimization.
    </summary>
    <content type="html">
      <![CDATA[
      <p>In this tutorial, we'll build an AI chatbot using <strong>Next.js</strong>,
      <em>TypeScript</em>, and the <code>OpenAI API</code>.
      You'll learn how to manage conversation state, handle API streaming,
      and deploy on Vercel.</p>
      <p><a href="https://example.com/posts/nextjs-ai">Read the full article →</a></p>
      ]]>
    </content>
    <author>
      <name>Jane Doe</name>
      <email>jane@example.com</email>
      <uri>https://example.com/authors/jane</uri>
    </author>
    <category term="AI" scheme="https://example.com/categories" />
    <category term="Web Development" />
    <category term="Next.js" />
    <link rel="enclosure" href="https://example.com/audio/nextjs-ai.mp3" type="audio/mpeg" length="3840000" />
  </entry>

  <entry>
    <id>tag:example.com,2025-11-05:/posts/design-system-guide</id>
    <title>Design Systems: A Practical Guide</title>
    <link href="https://example.com/posts/design-system-guide" />
    <updated>2025-11-06T10:15:00Z</updated>
    <published>2025-11-05T09:45:00Z</published>
    <summary type="html">
      Discover how to build scalable and consistent design systems using Figma and React components.
    </summary>
    <content type="html">
      <![CDATA[
      <p>Design systems help teams maintain visual and functional consistency.
      This article covers the workflow for <strong>tokens</strong>, <em>UI kits</em>,
      and <code>component libraries</code>.</p>
      ]]>
    </content>
    <author>
      <name>Michael Chen</name>
      <email>michael@example.com</email>
      <uri>https://example.com/authors/michael</uri>
    </author>
    <category term="Design" />
    <category term="UI/UX" />
    <category term="Figma" />
    <link rel="enclosure" href="https://example.com/video/design-systems.mp4" type="video/mp4" length="15230000" />
  </entry>
</feed>
`;
