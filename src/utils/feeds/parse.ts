import { parseFeed } from "@rowanmanning/feed-parser";
import type { Data, DataItem, FeedType } from "@/types";
import { EMPTY_DATA, parseData } from "@/types";
import { detectLanguage } from "@/utils";

export function parse<T extends object>(data: T | string, type: "raw"): Data;

/**
 * Parse feed content of standard feed formats (RSS, Atom, etc.).
 *
 * This overload handles standard syndication feed formats using the feed-parser library.
 * It automatically extracts metadata, items, authors, categories, and other feed elements.
 *
 * @param content - The raw feed content as an XML/text string
 * @param type - The feed format type: "rss", "atom", or undefined for auto-detection
 * @returns {Data} The parsed Data object containing feed metadata and items
 * @throws {Error} If content is not a string or parsing fails
 * @example
 * ```ts
 * // Parse an feed
 * const feedData = parse(XMLString);
 * ```
 */
export function parse(XMLString: string, type?: "rss" | "atom"): Data;

export function parse<T extends object>(content: string | T, type: FeedType = "rss"): Data {
	if (type === "raw") {
		if (typeof content !== "string" && typeof content !== "object") {
			throw new Error("Parse Error: Content must be a string or object for raw type");
		}
		if (content === null) {
			throw new Error("Parse Error: Content cannot be null");
		}

		let formattedContent: T;
		try {
			formattedContent = typeof content === "string" ? JSON.parse(content) : (content as T);
		} catch (error) {
			throw new Error(
				`Parse Error: Invalid JSON string - ${error instanceof Error ? error.message : String(error)}`,
			);
		}

		if (typeof formattedContent !== "object" || formattedContent === null) {
			throw new Error("Parse Error: Parsed content must be an object");
		}

		return parseData({
			...EMPTY_DATA,
			...formattedContent,
		});
	} else {
		if (typeof content !== "string") {
			throw new Error("Parse Error: Content must be a string for feed types");
		}

		const parsedFeed = parseFeed(content);
		const data: Data = {
			...EMPTY_DATA,

			author: parsedFeed.authors?.[0]
				? {
						email: parsedFeed.authors[0].email || undefined,
						link: parsedFeed.authors[0].url || undefined,
						name: parsedFeed.authors[0].name || undefined,
					}
				: undefined,
			category: parsedFeed.categories?.[0]?.label ?? undefined,
			copyright: parsedFeed.copyright || undefined,
			description: parsedFeed.description || undefined,
			image: parsedFeed.image?.url,

			// TODO:
			// id:
			// podcast:
			// ttl:
			item:
				parsedFeed.items.length > 0
					? parsedFeed.items.map((item) => {
							return {
								audio:
									item.mediaAudio.length > 0
										? {
												length: item.mediaAudio[0].length ?? undefined,
												title: item.mediaAudio[0].title ?? undefined,
												type: item.mediaAudio[0].type ?? undefined,
												url: item.mediaAudio[0].url,
											}
										: undefined,
								author:
									item.authors.length > 0
										? item.authors.map((item) => ({
												email: item.email ?? undefined,
												link: item.url ?? undefined,
												name: item.name ?? undefined,
											}))
										: undefined,
								category:
									item.categories.length > 0
										? item.categories.map((category) => ({
												name: category.label ?? category.term,
												scheme: category.url ?? undefined,
												term: category.term,
											}))
										: undefined,
								content: item.content ?? undefined,
								date: item.updated ?? new Date(),
								description: item.description ?? undefined,
								id: item.id ?? undefined,
								image: item.image
									? {
											title: item.image.title ?? undefined,
											url: item.image.url,
										}
									: undefined,
								link: item.url ?? "",
								title: item.title ?? "No title",
								video:
									item.mediaVideos.length > 0
										? {
												length: item.mediaVideos[0].length ?? undefined,
												title: item.mediaVideos[0].title ?? undefined,
												type: item.mediaVideos[0].type ?? undefined,
												url: item.mediaVideos[0].url,
											}
										: undefined,
							} satisfies DataItem;
						})
					: undefined,
			language: parsedFeed.language ? detectLanguage(parsedFeed.language) : undefined,
			link: parsedFeed.url ?? "",
			title: parsedFeed.title ?? "No title",
			updated: parsedFeed.updated ?? undefined,
		};
		return data;
	}
}
