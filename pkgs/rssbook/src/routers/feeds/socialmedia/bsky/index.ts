import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

const APP_URL = "https://bsky.app";
const API_URL = "https://api.bsky.app/xrpc";

type BskyPost = {
	author?: { displayName?: string; handle?: string };
	indexedAt?: string;
	record?: { text?: string };
	uri?: string;
};

export default new Source({
	description: "Public posts and search feeds from Bluesky.",
	domain: "bsky.app",
	slug: "bsky",
	title: "Bluesky",
})
	.feed(
		{
			description: "Fetch latest Bluesky posts matching a keyword.",
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Keyword Search",
		},
		(app) =>
			app.get(
				"/keyword/:keyword",
				async ({ cache, date, ofetch, params: { keyword } }) => {
					const link = `${APP_URL}/search?q=${encodeURIComponent(keyword)}`;
					const apiUrl = `${API_URL}/app.bsky.feed.searchPosts?q=${encodeURIComponent(keyword)}&limit=25&sort=latest`;
					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const response = await ofetch<{ posts?: BskyPost[] }>(apiUrl, { responseType: "json" });
						return (response.posts ?? []).map((post) => toItem(post, date));
					});

					return {
						description: `Latest Bluesky posts matching "${keyword}".`,
						item,
						language: "en",
						link,
						title: `Bluesky Keyword - ${keyword}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						keyword: t.String({ description: "Keyword to search for." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch latest public posts from a Bluesky profile.",
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Profile Posts",
		},
		(app) =>
			app.get(
				"/profile/:handle",
				async ({ cache, date, ofetch, params: { handle } }) => {
					const link = `${APP_URL}/profile/${handle}`;
					const apiUrl = `${API_URL}/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(handle)}&limit=25`;
					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const response = await ofetch<{ feed?: Array<{ post?: BskyPost }> }>(apiUrl, {
							responseType: "json",
						});
						return (response.feed ?? [])
							.map((entry) => entry.post)
							.filter((post): post is BskyPost => !!post)
							.map((post) => toItem(post, date));
					});

					return {
						description: `Latest public posts from ${handle}.`,
						item,
						language: "en",
						link,
						title: `Bluesky Profile - ${handle}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						handle: t.String({ description: "Bluesky handle, for example bsky.app." }),
					}),
				},
			),
	);

function toItem(post: BskyPost, parseDate: (value: string) => Date): DataItem {
	const handle = post.author?.handle ?? "unknown";
	const rkey = post.uri?.split("/").pop() ?? "";
	const link = `${APP_URL}/profile/${handle}/post/${rkey}`;
	const text = post.record?.text?.trim() || "(no text)";

	return {
		author: [{ name: post.author?.displayName || handle }],
		date: parseDate(post.indexedAt ?? new Date().toISOString()),
		description: text,
		link,
		title: text.slice(0, 80),
	} satisfies DataItem;
}
