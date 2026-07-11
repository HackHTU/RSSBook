import { Elysia, t } from "elysia";
import { ofetch } from "ofetch";
import { injectPlugin, renderQuery } from "@/plugins";
import type { Data } from "@/types";
import { FilterFeedError, InvalidOverrideJsonError } from "@/utils/error";
import { filter, parse } from "@/utils";
import type { FilterOptions } from "@/utils/feeds/filter";

export default new Elysia({
	detail: {
		description: `
Filter feed items by keywords, date, author, categories, or limit count.
		`,
	},
	name: "RSSBook/Router/Utils/Filter",
	prefix: "/filter",
})
	.use(injectPlugin)
	.get(
		"/",
		async ({
			query: {
				feed,
				include,
				exclude,
				caseSensitive,
				after,
				before,
				author,
				authorExclude,
				category,
				categoryExclude,
				limit,
				fromEnd,
				override,
			},
		}) => {
			try {
				// Fetch and parse the feed
				const response = await ofetch(feed, {
					responseType: "text",
				});
				const data = parse(response);

				// Build filter options
				const filterOptions: FilterOptions = {};

				// Keywords filter
				if (include || exclude || caseSensitive) {
					filterOptions.keywords = {
						caseSensitive: caseSensitive ?? false,
						exclude: exclude?.split(",").map((k) => k.trim()),
						include: include?.split(",").map((k) => k.trim()),
					};
				}

				// Date filter
				if (after || before) {
					filterOptions.date = {
						after: after ? new Date(after) : undefined,
						before: before ? new Date(before) : undefined,
					};
				}

				// Author filter
				if (author || authorExclude) {
					filterOptions.author = {
						exclude: authorExclude?.split(",").map((a) => a.trim()),
						include: author?.split(",").map((a) => a.trim()),
					};
				}

				// Categories filter
				if (category || categoryExclude) {
					filterOptions.categories = {
						exclude: categoryExclude?.split(",").map((c) => c.trim()),
						include: category?.split(",").map((c) => c.trim()),
					};
				}

				// Limit filter
				if (limit) {
					filterOptions.limit = {
						count: limit,
						fromStart: !fromEnd,
					};
				}

				// Parse override if provided
				let overrideData: Partial<Omit<Data, "item">> | undefined;
				if (override) {
					try {
						overrideData = JSON.parse(override);
					} catch (error) {
						throw new InvalidOverrideJsonError(
							`Invalid override JSON: ${error instanceof Error ? error.message : String(error)}`,
							error,
						);
					}
				}

				// Apply filter
				const filtered = filter(data, filterOptions, overrideData);

				return filtered;
			} catch (error) {
				throw new FilterFeedError(
					`Failed to fetch or filter feed: ${error instanceof Error ? error.message : String(error)}`,
					error,
				);
			}
		},
		{
			query: t.Object({
				...{
					after: t.Optional(
						t.String({
							description: "Filter items published after this date (ISO 8601)",
							examples: ["2024-01-01", "2024-01-01T00:00:00Z"],
						}),
					),
					before: t.Optional(
						t.String({
							description: "Filter items published before this date (ISO 8601)",
							examples: ["2024-12-31", "2024-12-31T23:59:59Z"],
						}),
					),
				},

				...{
					caseSensitive: t.Optional(
						t.Boolean({
							default: false,
							description: "Whether keyword search is case sensitive",
							examples: [true, false],
						}),
					),
					exclude: t.Optional(
						t.String({
							description: "Keywords to exclude (comma-separated)",
							examples: ["spam", "ads,spam"],
						}),
					),
					include: t.Optional(
						t.String({
							description: "Keywords to include (comma-separated, OR operation)",
							examples: ["AI", "technology,programming"],
						}),
					),
				},

				author: t.Optional(
					t.String({
						description: "Filter by author names to include (comma-separated)",
						examples: ["John Doe", "Jane Smith,John Doe"],
					}),
				),

				authorExclude: t.Optional(
					t.String({
						description: "Filter by author names to exclude (comma-separated)",
						examples: ["Bot", "Spam Author"],
					}),
				),

				category: t.Optional(
					t.String({
						description: "Filter by categories to include (comma-separated)",
						examples: ["technology", "AI,machine learning"],
					}),
				),

				categoryExclude: t.Optional(
					t.String({
						description: "Filter by categories to exclude (comma-separated)",
						examples: ["spam", "ads,promotions"],
					}),
				),

				feed: t.String({
					description: "Feed URL to filter",
					examples: ["https://www.ruanyifeng.com/blog/atom.xml"],
					format: "uri",
				}),

				fromEnd: t.Optional(
					t.Boolean({
						default: false,
						description: "Take items from end instead of start (when using limit)",
						examples: [true, false],
					}),
				),

				limit: t.Optional(
					t.Number({
						description: "Maximum number of items to return",
						examples: [10, 20],
						minimum: 1,
					}),
				),

				override: t.Optional(
					t.String({
						description: "Override feed metadata (JSON string)",
						examples: [
							JSON.stringify({
								description: "Filtered feed",
								title: "My Filtered Feed",
							}),
						],
					}),
				),

				...renderQuery,
			}),
		},
	);
