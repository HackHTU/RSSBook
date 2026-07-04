import { Elysia, t } from "elysia";
import { injectPlugin, renderQuery } from "@/plugins";
import { allFeedTypes, type Data, type FeedType } from "@/types";
import { parse } from "@/utils";

export default new Elysia({
	detail: {
		description: `
Transform feed items to a different format.
		`,
	},
	name: "RSSBook/Router/Utils/Transform",
	prefix: "/transform",
})
	.use(injectPlugin)
	.get(
		"/",
		async ({ query: { feed, from }, ofetch }) => {
			try {
				let data: Data;
				if (from === "raw") {
					// For raw JSON, let ofetch auto-parse
					const response = await ofetch<object>(feed);
					data = parse(response, from);
				} else {
					// For RSS/Atom, get raw text without auto-parsing
					const response = await ofetch(feed, {
						responseType: "text",
					});
					data = parse(response, from);
				}

				return data;
			} catch (error) {
				throw new Error(`Failed to fetch or parse feed from ${feed}: ${error}`);
			}
		},
		{
			query: t.Object({
				feed: t.String({
					description: "URL of the feed to transform.",
					format: "uri",
				}),
				from: t.UnionEnum(
					allFeedTypes.filter((type) => type !== "json") as [
						Exclude<FeedType, "json">,
						...Exclude<FeedType, "json">[],
					],
				),

				...renderQuery,
			}),
		},
	);
