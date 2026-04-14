import Elysia, { t } from "elysia";
import { initPlugin } from "@/plugins";
import { type Data, type DataItem, EMPTY_DATA, feedType, type ThemeProps } from "@/types";
import { type Cache, filter, logger, ofetch, parse, render, sort, union } from "@/utils";

const DEFAULT_META: ThemeProps["meta"] = {
	atomFeed: "/books/atom",
	description: "A simple RSS feed reader and aggregator.",
	jsonFeed: "/books/json",
	rssFeed: "/books/rss",
	title: "RSSBook",
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

interface CachedBooksData {
	/** Sorted feed data */
	sortedData: Data;
	/** All categories (sorted) */
	categories: ThemeProps["categories"];
}

async function getAllFeedData(feedUrls: string[]): Promise<Data> {
	if (feedUrls.length === 0) {
		return EMPTY_DATA;
	}

	const feedResults = await Promise.allSettled(
		feedUrls.map(async (feedUrl) => {
			try {
				const data = await ofetch(feedUrl, { responseType: "text" });
				const parsed = parse(data);
				if (parsed) {
					return parsed;
				}
			} catch (error) {
				logger.error(`Failed to fetch or parse feed: ${feedUrl}`, error);
				return null;
			}

			return null;
		}),
	);

	const validFeeds = feedResults
		.filter(
			(result): result is PromiseFulfilledResult<Data> =>
				result.status === "fulfilled" && result.value !== null,
		)
		.map((result) => result.value);

	if (validFeeds.length === 0) {
		return EMPTY_DATA;
	}

	if (validFeeds.length === 1) {
		return validFeeds[0];
	}

	const [firstFeed, ...restFeeds] = validFeeds;
	return union(firstFeed, restFeeds);
}

/** Fetch and process books data with caching */
async function getCachedBooksData(feeds: string[], cache: Cache): Promise<CachedBooksData> {
	// TODO:
	return cache.tryGet("rssbook:books", async () => {
		// Fetch raw feed data
		const rawData = await getAllFeedData(feeds);

		// Sort data by date
		const sortedData = sort(rawData);

		// Extract all categories from sorted data
		const categories: ThemeProps["categories"] = Array.from(
			new Set(
				(sortedData.item || [])
					.flatMap((item) => item.category?.map((cat) => cat.name) || [])
					.filter((name): name is string => name !== undefined),
			),
		)
			.sort((a, b) => a.localeCompare(b))
			.map((name) => ({ name }));

		return { categories, sortedData };
	});
}

export const bookPlugin = new Elysia({
	name: "RSSBook/Book",
	tags: ["_"],
})
	.use(initPlugin())
	.get(
		"/",
		async ({
			query: { page, limit, search, category },
			rssbook: {
				books: { feeds, meta, theme },
				cache,
			},
		}) => {
			// Get cached sorted data and categories
			const { sortedData, categories: allCategories } = await getCachedBooksData(feeds, cache);

			// Apply search and category filters (not cached due to dynamic params)
			const filteredData = filter(sortedData, {
				...(!!search && {
					keywords: {
						caseSensitive: false,
						include: [search],
					},
				}),
				...(!!category &&
					category !== "all" && {
						categories: {
							include: [category],
						},
					}),
			});

			const allItems: DataItem[] = filteredData.item || [];

			// Pagination calculation
			const total = allItems.length;
			const pageSize = Math.min(limit, MAX_PAGE_SIZE);
			const totalPages = Math.ceil(total / pageSize);
			const currentPage = Math.max(1, Math.min(page, totalPages || 1));
			const offset = (currentPage - 1) * pageSize;
			const items = allItems.slice(offset, offset + pageSize);

			const { item: _, ...dataInfo } = sortedData;

			const props: ThemeProps = {
				categories: allCategories,
				dataInfo,
				filter: {
					category: category || "all",
					search: search || "",
				},
				items,
				meta: {
					...DEFAULT_META,
					...meta,
				},
				pagination: {
					hasNext: currentPage < totalPages,
					hasPrev: currentPage > 1,
					limit: pageSize,
					page: currentPage,
					total,
					totalPages,
				},
			};

			const content: string = await theme.render(props);

			// ISSUE: return type Response is not recognized correctly
			return new Response(content, {
				headers: { "Content-Type": "text/html; charset=utf-8" },
				status: 200,
			});
		},
		{
			query: t.Object({
				category: t.Optional(
					t.String({
						description: "Category filter",
					}),
				),
				limit: t.Number({
					default: DEFAULT_PAGE_SIZE,
					description: "Items per page",
					maximum: MAX_PAGE_SIZE,
					minimum: 1,
				}),
				page: t.Number({
					default: 1,
					description: "Page number",
					minimum: 1,
				}),
				search: t.Optional(
					t.String({
						description: "Search keyword",
					}),
				),
			}),
		},
	)
	.get(
		"/books/:type",
		async ({
			params: { type },
			rssbook: {
				books: { feeds },
				cache,
			},
		}) => {
			// Reuse cached processed data
			const { sortedData } = await getCachedBooksData(feeds, cache);
			return render(sortedData, type);
		},
		{
			detail: { description: "Feed" },
			params: t.Object({
				type: feedType,
			}),
		},
	);
