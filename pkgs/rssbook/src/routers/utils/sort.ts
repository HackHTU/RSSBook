import { Elysia, t } from "elysia";
import { ofetch } from "ofetch";
import { injectPlugin, renderQuery } from "@/plugins";
import type { Data } from "@/types";
import { parse, sort } from "@/utils";
import { InvalidOverrideJsonError, SortFeedError } from "@/utils/error";

export default new Elysia({
	detail: {
		description: `
Sort feed items by publication date.

By default, sorts items in **descending order** (newest first).`,
	},
	name: "RSSBook/Router/Utils/Sort",
	prefix: "/sort",
})
	.use(injectPlugin)
	.get(
		"/",
		async ({ query: { feed, order, override } }) => {
			try {
				// Fetch and parse the feed
				const response = await ofetch(feed, { responseType: "text" });
				const data = parse(response);

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

				const desc = order !== "asc";
				const sorted = sort(data, "date", desc);

				return {
					...sorted,
					...overrideData,
				};
			} catch (error) {
				throw new SortFeedError(
					`Failed to fetch or sort feed: ${error instanceof Error ? error.message : String(error)}`,
					error,
				);
			}
		},
		{
			query: t.Object({
				feed: t.String({
					description: "Feed URL to sort",
					examples: ["https://www.ruanyifeng.com/blog/atom.xml"],
					format: "uri",
				}),
				order: t.Optional(
					t.Union([t.Literal("asc"), t.Literal("desc")], {
						default: "desc",
						description: "Sort order: 'asc' for oldest first, 'desc' for newest first",
						examples: ["desc", "asc"],
					}),
				),
				override: t.Optional(
					t.String({
						description: "Override feed metadata (JSON string)",
						examples: [
							JSON.stringify({
								description: "Sorted feed by publication date",
								title: "Sorted Feed",
							}),
						],
					}),
				),

				...renderQuery,
			}),
		},
	);
