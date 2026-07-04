import { Feed } from "feed";
import { type Data, type FeedType, isFeedType, parseData } from "@/types/data";
import { uuid } from "../uuid";

/**
 * Add `xslt` stylesheet link to the feed XML.
 *
 * @todo: [May Be Deprecated](https://github.com/whatwg/html/issues/11523)
 *
 * @param xml the raw XML string
 * @param type the feed type: "rss" or "atom"
 * @returns styled XML string
 */
export function addStylesheet(xml: string, type: "rss" | "atom"): string {
	if (type !== "rss" && type !== "atom") {
		return xml;
	}
	if (xml.includes("xml-stylesheet")) {
		return xml;
	}

	const pi = `<?xml-stylesheet href="/xsl/${type}.xsl" type="text/xsl" media="screen"?>`;

	// Look for an XML declaration near the start and insert after it if present.
	const head = xml.slice(0, 200);
	const declMatch = head.match(/^<\?xml[^?]*\?>/i);

	if (declMatch) {
		const declEnd = declMatch[0].length;
		// insert PI after declaration, trim any immediate whitespace after decl
		return `${xml.slice(0, declEnd)}\n${pi}\n${xml.slice(declEnd).replace(/^\s+/, "")}`;
	}

	// no declaration — prepend PI
	return `${pi}\n${xml}`;
}

/**
 * Render feed data into specified format.
 *
 * @param data the feed data to render
 * @param format the feed format, default is "rss". The `raw` format outputs the raw feed object as JSON.
 * @returns the rendered feed as a string
 */
export function render(data: Data, format: FeedType = "rss", styled: boolean = true): string {
	if (!isFeedType(format)) {
		throw new Error(`Invalid feed format: ${format}.`);
	}

	if (format === "raw") {
		return JSON.stringify(data, null, 2);
	}

	const validDate = parseData(data);

	const feed = new Feed({
		copyright: "RSSBook",
		generator: "RSSBook",
		id: uuid(),

		...validDate,
	});

	if (validDate.item && Array.isArray(validDate.item) && validDate.item.length > 0) {
		validDate.item.forEach((item) => {
			feed.addItem(item);
		});
	}

	try {
		switch (format) {
			case "rss": {
				const rss = feed.rss2();
				return styled ? addStylesheet(rss, "rss") : rss;
			}

			case "atom": {
				const atom = feed.atom1();
				return styled ? addStylesheet(atom, "atom") : atom;
			}
			case "json":
				return feed.json1();

			default:
				throw new Error(`Unsupported feed format: ${format}.`);
		}
	} catch (error) {
		throw new Error(
			`Failed to generate ${format} feed: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}
