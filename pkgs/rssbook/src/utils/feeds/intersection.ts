import type { Data, DataItem } from "@/types/data";

/**
 * Finds common items across multiple feeds, returning only items that appear in all feeds.
 *
 * @template T - The type of the hash key used for item comparison
 * @param reference - The reference feed that provides the base structure and metadata
 * @param feeds - Array of feeds to intersect with the reference feed
 * @param override - Optional partial data to override the returned feed properties (excluding items)
 * @param options - Configuration options for the intersection operation
 * @param options.hashFn - Custom hash function to determine item identity. Defaults to using guid/title/link
 * @returns A new Data object containing only items present in all feeds
 *
 * @example
 * ```typescript
 * const common = intersection(
 *   baseFeed,
 *   [feed1, feed2],
 *   { title: "Common Articles" },
 *   {
 *     hashFn: (item) => item.guid || item.title
 *   }
 * );
 * ```
 */
function intersection(
	base: Data,
	feed: Data,
	override?: Omit<Partial<Data>, "items">,
	option?: {
		hashFn?: (item: DataItem) => string | number;
	},
): Data;
function intersection(
	base: Data,
	feeds: Data[],
	override?: Omit<Partial<Data>, "items">,
	options?: {
		hashFn?: (item: DataItem) => string | number;
	},
): Data;
function intersection<T extends string | number = string>(
	reference: Data,
	feeds: Data | Data[],
	override?: Omit<Partial<Data>, "items">,
	options?: {
		hashFn?: (item: DataItem) => T;
	},
): Data {
	// Default hash function: use guid, title, or link as unique identifier
	const defaultHashFn = (item: DataItem): string => {
		// DataItem.guid is a string in our types; prefer it when present
		if (item?.id && typeof item.id === "string") {
			return item.id;
		}

		// Fallback to title or link
		return item.title || item.link || "";
	};

	const hashFn = options?.hashFn || (defaultHashFn as (item: DataItem) => T);

	// Convert feeds to array if single feed
	const feedsArray = Array.isArray(feeds) ? feeds : [feeds];
	const allFeeds = [reference, ...feedsArray];

	// Create hash maps for each feed
	const feedHashMaps: Set<T>[] = [];

	for (const feed of allFeeds) {
		const hashSet = new Set<T>();
		if (feed.item) {
			for (const item of feed.item) {
				const hash = hashFn(item);
				hashSet.add(hash);
			}
		}
		feedHashMaps.push(hashSet);
	}

	// Find items that exist in ALL feeds
	const commonItems: DataItem[] = [];

	if (reference.item) {
		for (const item of reference.item) {
			const hash = hashFn(item);

			// Check if this item exists in all other feeds
			const existsInAllFeeds = feedHashMaps.every((hashSet) => hashSet.has(hash));

			if (existsInAllFeeds) {
				commonItems.push(item);
			}
		}
	}

	// Sort by publication date (newest first)
	commonItems.sort((a, b) => {
		const dateA = a.date ? new Date(a.date).getTime() : 0;
		const dateB = b.date ? new Date(b.date).getTime() : 0;
		return dateB - dateA;
	});

	// Build the result using reference as base, applying overrides
	const result: Data = {
		...reference,
		...override,
		item: commonItems,
	};

	return result;
}

export { intersection };
