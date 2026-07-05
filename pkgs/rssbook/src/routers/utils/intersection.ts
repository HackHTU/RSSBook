import { Elysia, t } from "elysia";
import { ofetch } from "ofetch";
import { injectPlugin, renderQuery } from "@/plugins";
import type { Data } from "@/types";
import { intersection, parse } from "@/utils";

export default new Elysia({
	detail: {
		description: `
Find common items across multiple RSS/Atom feeds.

Returns only items that appear in **all** provided feeds, based on item ID, title, or link matching.

`,
	},
	name: "RSSBook/Router/Utils/Intersection",
	prefix: "/intersection",
})
	.use(injectPlugin)
	.get(
		"/",
		async ({ query: { feeds, override }, logger }) => {
			if (feeds.length < 2) {
				throw new Error("At least 2 feeds are required for intersection");
			}

			try {
				// Fetch and parse all feeds
				const promises = feeds.map(async (feedUrl) => {
					try {
						const response = await ofetch(feedUrl, { responseType: "text" });
						return parse(response);
					} catch (error) {
						logger.error(`Failed to fetch or parse feed from ${feedUrl}: ${error}`);
						return null;
					}
				});

				const results = await Promise.allSettled(promises);
				const datas: Data[] = results
					.filter(
						(result): result is PromiseFulfilledResult<Data | null> =>
							result.status === "fulfilled",
					)
					.map((result) => result.value)
					.filter((result): result is Data => result !== null);

				if (datas.length < 2) {
					throw new Error("At least 2 valid feeds are required for intersection");
				}

				// Parse override if provided
				let overrideData: Partial<Omit<Data, "item">> | undefined;
				if (override) {
					try {
						overrideData = JSON.parse(override);
					} catch (error) {
						throw new Error(`Invalid override JSON: ${error}`);
					}
				}

				// Use first feed as reference, intersect with others
				const [reference, ...otherFeeds] = datas;
				const result = intersection(reference, otherFeeds, overrideData);

				return result;
			} catch (error) {
				throw new Error(`Failed to compute intersection: ${error}`);
			}
		},
		{
			query: t.Object({
				feeds: t.Array(
					t.String({
						format: "uri",
					}),
					{
						description: "Array of feed URLs to intersect (minimum 2), divided by comma.",
						examples: ["https://www.ruanyifeng.com/blog/atom.xml,https://techcrunch.com/feed/"],
					},
				),
				override: t.Optional(
					t.String({
						description: "Override feed metadata (JSON string)",
						examples: [
							JSON.stringify({
								description: "Common articles across multiple sources",
								title: "Intersection Feed",
							}),
						],
					}),
				),
				...renderQuery,
			}),
		},
	);
