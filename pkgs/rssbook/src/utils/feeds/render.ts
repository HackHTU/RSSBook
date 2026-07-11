import { Feed } from "feed";
import { type Data, type FeedType, isFeedType, parseData } from "@/types/data";
import { FeedFormatError, FeedRenderError, InvalidFeedFormatError } from "@/utils/error";

/**
 * Render feed data into specified format.
 *
 * @param data the feed data to render
 * @param format the feed format, default is "rss". The `raw` format outputs the raw feed object as JSON.
 * @returns the rendered feed as a string
 */
export function render(data: Data, format: FeedType = "rss", styled: boolean = true): string {
	if (!isFeedType(format)) {
		throw new InvalidFeedFormatError(format);
	}

	if (format === "raw") {
		return JSON.stringify(data, null, 2);
	}

	const validDate = parseData(data);

	const feed = new Feed({
		copyright: "RSSBook",
		generator: "RSSBook",
		stylesheet: styled ? `/xsl/${format}.xsl` : undefined,

		...validDate,
	});

	if (validDate.item && Array.isArray(validDate.item) && validDate.item.length > 0) {
		validDate.item.forEach((item) => {
			feed.addItem(item);
		});
	}

	try {
		switch (format) {
			case "rss":
				return feed.rss2();
			case "atom":
				return feed.atom1();
			case "json":
				return feed.json1();

			default:
				throw new FeedFormatError(format);
		}
	} catch (error) {
		throw new FeedRenderError(format, error);
	}
}
