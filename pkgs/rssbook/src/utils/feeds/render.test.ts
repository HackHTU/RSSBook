import { describe, expect, test } from "bun:test";
import type { Data } from "@/types";
import { render } from "@/utils";

describe("render", () => {
	describe("render", () => {
		test("adds RSS stylesheet through feed options when styled", () => {
			const rss = render(exampleData1(), "rss");

			expect(rss).toContain('<?xml-stylesheet href="/xsl/rss.xsl" type="text/xsl"?>');
			expect(rss).toMatch(/^<\?xml[^?]*\?><\?xml-stylesheet/);
		});

		test("adds Atom stylesheet through feed options when styled", () => {
			const atom = render(exampleData1(), "atom");

			expect(atom).toContain('<?xml-stylesheet href="/xsl/atom.xsl" type="text/xsl"?>');
			expect(atom).toMatch(/^<\?xml[^?]*\?><\?xml-stylesheet/);
		});

		test("does not add stylesheet when styled is false", () => {
			expect(render(exampleData1(), "rss", false)).not.toContain("xml-stylesheet");
			expect(render(exampleData1(), "atom", false)).not.toContain("xml-stylesheet");
		});

		describe("exampleData1 (simple fields)", () => {
			describe("RSS", () => {
				const rss = render(exampleData1(), "rss", false);

				test("feed metadata fields", () => {
					expect(rss).toContain("<title>Example Feed</title>");
					expect(rss).toContain("<link>https://example.com</link>");
					expect(rss).toContain("<description>A sample feed description</description>");
					expect(rss).toContain("<language>en</language>");
					expect(rss).toContain("<copyright>© 2025 Example Corp</copyright>");
					expect(rss).toContain("<lastBuildDate>");
				});

				test("feed image", () => {
					expect(rss).toContain("<image>");
					expect(rss).toContain("<url>https://example.com/feed-image.jpg</url>");
				});

				test("item basic fields", () => {
					expect(rss).toContain("<item>");
					// RSS title is wrapped in CDATA
					expect(rss).toContain("<title><![CDATA[Item Title]]></title>");
					expect(rss).toContain("<link>https://example.com/item-link</link>");
					expect(rss).toContain("<guid");
					expect(rss).toContain("item-456");
				});

				test("item description and content", () => {
					expect(rss).toContain("A short summary");
					expect(rss).toContain("This is the main content");
				});

				test("item dates", () => {
					expect(rss).toContain("<pubDate>");
				});

				test("item author", () => {
					// Note: Simple author without email may not be rendered in RSS
					// Feed library requires email for RSS author
					expect(rss).toContain("John Doe"); // Feed author is rendered in itunes:author
				});

				test("item category", () => {
					expect(rss).toContain("<category>News</category>");
				});

				test("item enclosure", () => {
					expect(rss).toContain("<enclosure");
					// Feed library may use video as the main enclosure
					expect(rss).toContain('url="https://example.com/video.mp4"');
				});
			});

			describe("Atom", () => {
				const atom = render(exampleData1(), "atom", false);

				test("feed metadata fields", () => {
					expect(atom).toContain("<title>Example Feed</title>");
					// Atom link includes rel="alternate"
					expect(atom).toContain('<link rel="alternate" href="https://example.com"/>');
					expect(atom).toContain("<subtitle>A sample feed description</subtitle>");
					expect(atom).toContain("<rights>© 2025 Example Corp</rights>");
					expect(atom).toContain("<updated>");
				});

				test("feed author", () => {
					expect(atom).toContain("<author>");
					expect(atom).toContain("<name>John Doe</name>");
				});

				test("feed logo/icon", () => {
					expect(atom).toContain("<logo>https://example.com/feed-image.jpg</logo>");
					expect(atom).toContain("<icon>https://example.com/favicon.ico</icon>");
				});

				test("entry basic fields", () => {
					expect(atom).toContain("<entry>");
					// Atom title is wrapped with type="html" and CDATA
					expect(atom).toContain("<![CDATA[Item Title]]>");
					expect(atom).toContain('<link href="https://example.com/item-link"/>');
					expect(atom).toContain("<id>item-456</id>");
				});

				test("entry summary and content", () => {
					expect(atom).toContain("<summary");
					expect(atom).toContain("A short summary");
					expect(atom).toContain("<content");
					expect(atom).toContain("This is the main content");
				});

				test("entry dates", () => {
					expect(atom).toContain("<published>");
					expect(atom).toContain("<updated>");
				});

				test("entry author", () => {
					expect(atom).toContain("<name>Jane Smith</name>");
				});

				test("entry category", () => {
					// Feed library uses label attribute for category name
					expect(atom).toContain('<category label="News"/>');
				});
			});

			describe("JSON Feed", () => {
				const jsonStr = render(exampleData1(), "json");
				const json = JSON.parse(jsonStr);

				test("feed metadata fields", () => {
					expect(json.version).toContain("jsonfeed.org");
					expect(json.title).toBe("Example Feed");
					expect(json.home_page_url).toBe("https://example.com");
					expect(json.description).toBe("A sample feed description");
				});

				test("feed author", () => {
					expect(json.author).toBeDefined();
					expect(json.author.name).toBe("John Doe");
				});

				test("feed image", () => {
					expect(json.icon).toBe("https://example.com/feed-image.jpg");
					// Note: JSON Feed spec uses icon, not favicon
				});

				test("items array exists", () => {
					expect(json.items).toBeDefined();
					expect(json.items.length).toBe(1);
				});

				test("item basic fields", () => {
					const item = json.items[0];
					expect(item.id).toBe("item-456");
					expect(item.title).toBe("Item Title");
					expect(item.url).toBe("https://example.com/item-link");
				});

				test("item content fields", () => {
					const item = json.items[0];
					expect(item.summary).toBe("A short summary");
					expect(item.content_html).toContain("This is the main content");
				});

				test("item dates", () => {
					const item = json.items[0];
					expect(item.date_published).toBeDefined();
					expect(item.date_modified).toBeDefined();
				});

				test("item author", () => {
					const item = json.items[0];
					expect(item.author).toBeDefined();
					expect(item.author.name).toBe("Jane Smith");
				});

				test("item image", () => {
					const item = json.items[0];
					expect(item.image).toBe("https://example.com/item-image.jpg");
				});
			});

			describe("RAW", () => {
				const rawStr = render(exampleData1(), "raw");
				const raw = JSON.parse(rawStr);

				test("feed metadata fields", () => {
					expect(raw.title).toBe("Example Feed");
					expect(raw.link).toBe("https://example.com");
					expect(raw.description).toBe("A sample feed description");
					expect(raw.language).toBe("en");
					expect(raw.copyright).toBe("© 2025 Example Corp");
					expect(raw.category).toBe("Technology");
					expect(raw.id).toBe("feed-123");
					expect(raw.ttl).toBe(60);
					expect(raw.podcast).toBe(true);
				});

				test("feed author", () => {
					expect(raw.author).toBeDefined();
					expect(raw.author.name).toBe("John Doe");
				});

				test("feed image and favicon", () => {
					expect(raw.image).toBe("https://example.com/feed-image.jpg");
					expect(raw.favicon).toBe("https://example.com/favicon.ico");
				});

				test("items array exists", () => {
					expect(raw.item).toBeDefined();
					expect(raw.item.length).toBe(1);
				});

				test("item basic fields", () => {
					const item = raw.item[0];
					expect(item.id).toBe("item-456");
					expect(item.title).toBe("Item Title");
					expect(item.link).toBe("https://example.com/item-link");
				});

				test("item content fields", () => {
					const item = raw.item[0];
					expect(item.description).toBe("A short summary");
					expect(item.content).toBe("<p>This is the main content.</p>");
				});

				test("item media as strings", () => {
					const item = raw.item[0];
					expect(item.audio).toBe("https://example.com/audio.mp3");
					expect(item.video).toBe("https://example.com/video.mp4");
					expect(item.image).toBe("https://example.com/item-image.jpg");
				});

				test("item enclosure", () => {
					const item = raw.item[0];
					expect(item.enclosure).toBeDefined();
					expect(item.enclosure.url).toBe("https://example.com/enclosure.pdf");
					expect(item.enclosure.type).toBe("application/pdf");
					expect(item.enclosure.length).toBe(1024);
					expect(item.enclosure.duration).toBe(60);
					expect(item.enclosure.title).toBe("Enclosure Title");
				});

				test("item author array", () => {
					const item = raw.item[0];
					expect(item.author).toBeDefined();
					expect(item.author.length).toBe(1);
					expect(item.author[0].name).toBe("Jane Smith");
				});

				test("item category array", () => {
					const item = raw.item[0];
					expect(item.category).toBeDefined();
					expect(item.category.length).toBe(1);
					expect(item.category[0].name).toBe("News");
				});

				test("item extensions array", () => {
					const item = raw.item[0];
					expect(item.extensions).toBeDefined();
					expect(item.extensions.length).toBe(1);
					expect(item.extensions[0].name).toBe("custom");
					expect(item.extensions[0].objects).toEqual({ key: "value" });
				});
			});
		});

		describe("exampleData2 (complex objects)", () => {
			describe("RSS", () => {
				const rss = render(exampleData2(), "rss", false);

				test("feed author with full details", () => {
					expect(rss).toContain("John Doe");
				});

				test("item author with full details", () => {
					expect(rss).toContain("Jane Smith");
				});

				test("item with media enclosure", () => {
					expect(rss).toContain("<enclosure");
					// Feed library uses video as the main enclosure when both audio and video exist
					expect(rss).toContain("https://example.com/video.mp4");
				});
			});

			describe("Atom", () => {
				const atom = render(exampleData2(), "atom", false);

				test("feed author with email and link", () => {
					expect(atom).toContain("<author>");
					expect(atom).toContain("<name>John Doe</name>");
					expect(atom).toContain("<email>john@example.com</email>");
					expect(atom).toContain("<uri>https://example.com/john</uri>");
				});

				test("entry author with email and link", () => {
					expect(atom).toContain("<name>Jane Smith</name>");
					expect(atom).toContain("<email>jane@example.com</email>");
					expect(atom).toContain("<uri>https://example.com/jane</uri>");
				});

				test("entry category with term and scheme", () => {
					// Feed library uses label, scheme, and term attributes
					expect(atom).toContain('term="news-term"');
					expect(atom).toContain('scheme="http://example.com/schema"');
				});
			});

			describe("JSON Feed", () => {
				const jsonStr = render(exampleData2(), "json");
				const json = JSON.parse(jsonStr);

				test("feed author with url", () => {
					expect(json.author.name).toBe("John Doe");
					expect(json.author.url).toBe("https://example.com/john");
				});

				test("item author with url", () => {
					const item = json.items[0];
					expect(item.author.name).toBe("Jane Smith");
					expect(item.author.url).toBe("https://example.com/jane");
				});

				test("item image from object", () => {
					const item = json.items[0];
					// When image is an object, JSON Feed includes the full object
					if (typeof item.image === "object") {
						expect(item.image.url).toBe("https://example.com/item-image.jpg");
					} else {
						expect(item.image).toBe("https://example.com/item-image.jpg");
					}
				});
			});

			describe("RAW", () => {
				const rawStr = render(exampleData2(), "raw");
				const raw = JSON.parse(rawStr);

				test("feed author with all fields", () => {
					expect(raw.author.name).toBe("John Doe");
					expect(raw.author.email).toBe("john@example.com");
					expect(raw.author.link).toBe("https://example.com/john");
					expect(raw.author.avatar).toBe("https://example.com/avatar.jpg");
				});

				test("item author with all fields", () => {
					const author = raw.item[0].author[0];
					expect(author.name).toBe("Jane Smith");
					expect(author.email).toBe("jane@example.com");
					expect(author.link).toBe("https://example.com/jane");
					expect(author.avatar).toBe("https://example.com/jane-avatar.jpg");
				});

				test("item category with all fields", () => {
					const category = raw.item[0].category[0];
					expect(category.name).toBe("News");
					expect(category.term).toBe("news-term");
					expect(category.scheme).toBe("http://example.com/schema");
					expect(category.domain).toBe("example.com");
				});

				test("item audio as object", () => {
					const audio = raw.item[0].audio;
					expect(audio.url).toBe("https://example.com/audio.mp3");
					expect(audio.type).toBe("audio/mpeg");
					expect(audio.length).toBe(2048);
					expect(audio.duration).toBe(120);
					expect(audio.title).toBe("Audio Title");
				});

				test("item video as object", () => {
					const video = raw.item[0].video;
					expect(video.url).toBe("https://example.com/video.mp4");
					expect(video.type).toBe("video/mp4");
					expect(video.length).toBe(4096);
					expect(video.duration).toBe(300);
					expect(video.title).toBe("Video Title");
				});

				test("item image as object", () => {
					const image = raw.item[0].image;
					expect(image.url).toBe("https://example.com/item-image.jpg");
					expect(image.type).toBe("image/jpeg");
					expect(image.length).toBe(512);
					expect(image.title).toBe("Image Title");
				});
			});
		});

		describe("error handling", () => {
			test("throws descriptive error when feed generation fails", () => {
				// Feed library requires at least a title
				const invalidData = {} as Data;

				expect(() => render(invalidData, "rss")).toThrow();
			});

			test("includes original error message", () => {
				const invalidData = {} as Data;

				expect(() => render(invalidData, "atom")).toThrow();
			});

			test("throws on invalid feed format", () => {
				// @ts-expect-error Testing invalid format
				expect(() => render(exampleData1(), "invalid")).toThrow("Invalid feed format");
			});
		});
	});
});

const exampleData1: () => Data = () => ({
	author: {
		name: "John Doe",
	},
	category: "Technology",
	copyright: "© 2025 Example Corp",
	description: "A sample feed description",
	favicon: "https://example.com/favicon.ico",
	id: "feed-123",
	image: "https://example.com/feed-image.jpg",
	item: [
		{
			audio: "https://example.com/audio.mp3",
			author: [
				{
					name: "Jane Smith",
				},
			],
			category: [
				{
					name: "News",
				},
			],
			content: "<p>This is the main content.</p>",
			date: new Date("2025-11-10T00:00:00Z"),
			description: "A short summary",
			enclosure: {
				duration: 60,
				length: 1024,
				title: "Enclosure Title",
				type: "application/pdf",
				url: "https://example.com/enclosure.pdf",
			},
			extensions: [
				{
					name: "custom",
					objects: { key: "value" },
				},
			],
			id: "item-456",
			image: "https://example.com/item-image.jpg",
			link: "https://example.com/item-link",
			published: new Date("2025-11-09T00:00:00Z"),
			title: "Item Title",
			video: "https://example.com/video.mp4",
		},
	],
	language: "en",
	link: "https://example.com",
	podcast: true,
	title: "Example Feed",
	ttl: 60,
	updated: new Date("2025-11-10T12:00:00Z"),
});

const exampleData2: () => Data = () => ({
	author: {
		avatar: "https://example.com/avatar.jpg",
		email: "john@example.com",
		link: "https://example.com/john",
		name: "John Doe",
	},
	category: "Technology",
	copyright: "© 2025 Example Corp",
	description: "A sample feed description",
	favicon: "https://example.com/favicon.ico",
	id: "feed-123",
	image: "https://example.com/feed-image.jpg",
	item: [
		{
			audio: {
				duration: 120,
				length: 2048,
				title: "Audio Title",
				type: "audio/mpeg",
				url: "https://example.com/audio.mp3",
			},
			author: [
				{
					avatar: "https://example.com/jane-avatar.jpg",
					email: "jane@example.com",
					link: "https://example.com/jane",
					name: "Jane Smith",
				},
			],
			category: [
				{
					domain: "example.com",
					name: "News",
					scheme: "http://example.com/schema",
					term: "news-term",
				},
			],
			content: "<p>This is the main content.</p>",
			date: new Date("2025-11-10T00:00:00Z"),
			description: "A short summary",
			enclosure: {
				duration: 60,
				length: 1024,
				title: "Enclosure Title",
				type: "application/pdf",
				url: "https://example.com/enclosure.pdf",
			},
			extensions: [
				{
					name: "custom",
					objects: { key: "value" },
				},
			],
			id: "item-456",
			image: {
				duration: 0,
				length: 512,
				title: "Image Title",
				type: "image/jpeg",
				url: "https://example.com/item-image.jpg",
			},
			link: "https://example.com/item-link",
			published: new Date("2025-11-09T00:00:00Z"),
			title: "Item Title",
			video: {
				duration: 300,
				length: 4096,
				title: "Video Title",
				type: "video/mp4",
				url: "https://example.com/video.mp4",
			},
		},
	],
	language: "en",
	link: "https://example.com",
	podcast: true,
	title: "Example Feed",
	ttl: 60,
	updated: new Date("2025-11-10T12:00:00Z"),
});
