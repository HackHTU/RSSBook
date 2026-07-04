import type { Data, DataItem } from "@/types/data";

/**
 * Merges multiple feeds into a single unified feed, removing duplicates based on item hash.
 *
 * @template T - The type of the hash key used for deduplication
 * @param reference - The reference feed that provides the base structure and metadata
 * @param feeds - Array of feeds to merge with the reference feed
 * @param override - Optional partial data to override the returned feed properties (excluding items)
 * @param options - Configuration options for the union operation
 * @param options.hashFn - Custom hash function to determine item uniqueness. Defaults to using guid/title/link
 * @returns A new Data object containing the merged and deduplicated items
 *
 * @example
 * ```typescript
 * const merged = union(
 *   baseFeed,
 *   [feed1, feed2],
 *   { title: "Combined Feed" },
 *   {
 *     hashFn: (item) => item.guid || item.title
 *   }
 * );
 * ```
 */

export function union(base: Data, feed: Data): Data;
export function union<T extends string | number = string>(
	reference: Data,
	feeds: Data | Data[],
	override?: Omit<Partial<Data>, "items">,
	options?: {
		hashFn?: (item: DataItem) => T;
	},
): Data;
export function union<T extends string | number = string>(
	reference: Data,
	feeds: Data | Data[],
	override?: Omit<Partial<Data>, "items">,
	options?: {
		hashFn?: (item: DataItem) => T;
	},
): Data {
	// Default hash function: use guid, title, or link as unique identifier
	const defaultHashFn = (item: DataItem) => {
		if (item?.id && typeof item.id === "string") {
			return item.id;
		}

		return item.title || item.link || "";
	};

	const hashFn = options?.hashFn || defaultHashFn;

	// Set to track seen items by their hash
	const seenHashes = new Set<string | number>();
	const mergedItems: DataItem[] = [];

	// Process all feeds including the reference feed
	const feedsArray = Array.isArray(feeds) ? feeds : [feeds];
	const allFeeds = [reference, ...feedsArray];

	for (const feed of allFeeds) {
		if (!feed.item) continue;

		for (const item of feed.item) {
			const hash = hashFn(item);
			if (!hash) continue;

			// Skip if we've already seen this item
			if (seenHashes.has(hash)) continue;

			seenHashes.add(hash);
			mergedItems.push(item);
		}
	}

	// Sort merged items by publication date (newest first)
	mergedItems.sort((a, b) => {
		const dateA = a.date ? new Date(a.date).getTime() : 0;
		const dateB = b.date ? new Date(b.date).getTime() : 0;
		return dateB - dateA;
	});

	// Build the result using reference as base, applying overrides
	const result: Data = {
		...reference,
		...override,
		item: mergedItems,
	};

	return result;
}
