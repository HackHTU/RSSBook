import type { Data, DataItem } from "@/types/data";
import { date } from "../date";

/**
 * Built-in filter types for common filtering operations
 */
type FilterOptions = {
	/** Filter by keywords in title, description, or content */
	keywords?: {
		/** Keywords to search for (OR operation) */
		include?: string[];
		/** Keywords to exclude (AND operation) */
		exclude?: string[];
		/** Case sensitive search */
		caseSensitive?: boolean;
	};
	/** Filter by publication date */
	date?: {
		/** Items published after this date */
		after?: Date | string;
		/** Items published before this date */
		before?: Date | string;
	};
	/** Filter by author */
	author?: {
		/** Author names to include */
		include?: string[];
		/** Author names to exclude */
		exclude?: string[];
	};
	/** Limit the number of items */
	limit?: {
		/** Maximum number of items to return */
		count: number;
		/** Take from start (true) or end (false) */
		fromStart?: boolean;
	};
	/** Filter by categories/tags */
	categories?: {
		/** Categories to include */
		include?: string[];
		/** Categories to exclude */
		exclude?: string[];
	};
};

/**
 * Filters feed items based on predefined criteria like keywords, dates, authors, etc.
 *
 * @param data - The feed data to filter
 * @param options - Filter options including keywords, date ranges, authors, etc.
 * @param override - Optional partial data to override the returned feed properties (excluding items)
 * @returns A new Data object with filtered items
 *
 * @example
 * ```typescript
 * const filtered = filter(
 *   feed,
 *  {
 *     keywords: { include: ["technology", "AI"], exclude: ["spam"] },
 *     date: { after: "2024-01-01" },
 *     limit: { count: 10 }
 *   }
 * );
 * ```
 */
function filter(data: Data, options: FilterOptions, override?: Omit<Partial<Data>, "items">): Data;

/**
 * Filters feed items using a custom filter function.
 *
 * @param data - The feed data to filter
 * @param filterFn - Custom function to determine which items to keep
 * @param override - Optional partial data to override the returned feed properties (excluding items)
 * @returns A new Data object with filtered items
 *
 * @example
 * ```typescript
 * const recentTech = filter(
 *   feed,
 *   (item) => {
 *   	const isRecent = item.pubDate && new Date(item.pubDate) > new Date('2024-01-01');
 *   	const isTech = item.title?.toLowerCase().includes('technology');
 *   	return isRecent && isTech;
 * 	 }
 * );
 * ```
 */
function filter(
	data: Data,
	filterFn: (item: DataItem, index: number) => boolean,
	override?: Omit<Partial<Data>, "items">,
): Data;

function filter(
	data: Data,
	optionsOrFn: FilterOptions | ((item: DataItem, index: number) => boolean),
	override?: Omit<Partial<Data>, "items">,
): Data {
	if (!data.item) {
		return {
			...data,
			...override,

			item: undefined,
		};
	}

	let filteredItems: DataItem[];

	// Custom function filter
	if (typeof optionsOrFn === "function") {
		filteredItems = data.item.filter(optionsOrFn);
	} else {
		// Built-in options filter
		const options = optionsOrFn;
		filteredItems = data.item.filter((item) => {
			// Keywords filter
			if (options.keywords) {
				const contentText = item.content ?? "";

				const searchableText = [item.title, item.description, contentText]
					.filter(Boolean)
					.join(" ");

				const text = options.keywords.caseSensitive ? searchableText : searchableText.toLowerCase();

				// Check include keywords (OR operation)
				if (options.keywords.include && options.keywords.include.length > 0) {
					const includeWords = options.keywords.caseSensitive
						? options.keywords.include
						: options.keywords.include.map((k) => k.toLowerCase());

					const hasIncludeKeyword = includeWords.some((keyword) => text.includes(keyword));
					if (!hasIncludeKeyword) return false;
				}

				// Check exclude keywords (AND operation - all must be absent)
				if (options.keywords.exclude && options.keywords.exclude.length > 0) {
					const excludeWords = options.keywords.caseSensitive
						? options.keywords.exclude
						: options.keywords.exclude.map((k) => k.toLowerCase());

					const hasExcludeKeyword = excludeWords.some((keyword) => text.includes(keyword));
					if (hasExcludeKeyword) return false;
				}
			}

			// Date filter
			if (options.date && item.date) {
				const itemDate = date(item.date as Date | string);

				if (options.date.after) {
					const afterDate = date(options.date.after);
					if (itemDate <= afterDate) return false;
				}

				if (options.date.before) {
					const beforeDate = date(options.date.before);
					if (itemDate >= beforeDate) return false;
				}
			}

			// Author filter (DataItem.author can be string or array)
			if (options.author) {
				const authorNames: string[] = [];
				if (item.author) {
					if (typeof item.author === "string") authorNames.push(item.author);
					else if (Array.isArray(item.author)) {
						for (const a of item.author) {
							if (!a) continue;
							if (typeof a === "string") authorNames.push(a);
							else if (typeof a === "object" && a.name) authorNames.push(a.name);
						}
					}
				}

				if (options.author.include && options.author.include.length > 0) {
					// If no author names and include filter is specified, exclude the item
					if (authorNames.length === 0) return false;
					const hasIncludeAuthor = authorNames.some((name) =>
						options.author?.include?.some((includeName) =>
							name.toLowerCase().includes(includeName.toLowerCase()),
						),
					);
					if (!hasIncludeAuthor) return false;
				}

				if (options.author.exclude && options.author.exclude.length > 0) {
					const hasExcludeAuthor = authorNames.some((name) =>
						options.author?.exclude?.some((excludeName) =>
							name.toLowerCase().includes(excludeName.toLowerCase()),
						),
					);
					if (hasExcludeAuthor) return false;
				}
			}

			// Categories filter (DataItem.category is Category[])
			if (options.categories) {
				const categoryNames: string[] = [];
				if (item.category) {
					for (const c of item.category) {
						if (typeof c === "string") {
							categoryNames.push(c);
						} else if (typeof c === "object" && c !== null) {
							const name = c.name || c.term || "";
							if (name) categoryNames.push(name);
						}
					}
				}

				if (options.categories.include && options.categories.include.length > 0) {
					// If no category names and include filter is specified, exclude the item
					if (categoryNames.length === 0) return false;
					const hasIncludeCategory = categoryNames.some((name) =>
						options.categories?.include?.some((includeName) =>
							name.toLowerCase().includes(includeName.toLowerCase()),
						),
					);
					if (!hasIncludeCategory) return false;
				}

				if (options.categories.exclude && options.categories.exclude.length > 0) {
					const hasExcludeCategory = categoryNames.some((name) =>
						options.categories?.exclude?.some((excludeName) =>
							name.toLowerCase().includes(excludeName.toLowerCase()),
						),
					);
					if (hasExcludeCategory) return false;
				}
			}
			return true;
		});

		// Apply limit filter
		if (options.limit) {
			const { count, fromStart = true } = options.limit;
			if (fromStart) {
				filteredItems = filteredItems.slice(0, count);
			} else {
				filteredItems = filteredItems.slice(-count);
			}
		}
	}

	// Build the result
	const result: Data = {
		...data,
		...override,
		item: filteredItems,
	};

	return result;
}

export { type FilterOptions, filter };
