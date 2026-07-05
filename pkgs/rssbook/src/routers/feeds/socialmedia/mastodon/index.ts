import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

type MastodonStatus = {
	account?: { display_name?: string; username?: string };
	content?: string;
	created_at?: string;
	id?: string;
	url?: string;
};

export default new Source({
	description: "Public timeline and hashtag feeds from Mastodon instances.",
	domain: "mastodon.social",
	slug: "mastodon",
	title: "Mastodon",
})
	.feed(
		{
			description: "Fetch the public local timeline from a Mastodon instance.",
			fulltext: true,
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Local Timeline",
		},
		(app) =>
			app.get(
				"/timeline/:site",
				async ({ cache, date, ofetch, params: { site } }) => {
					const root = normalizeInstance(site);
					const apiUrl = `${root}/api/v1/timelines/public?local=true&limit=20`;
					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const statuses = await ofetch<MastodonStatus[]>(apiUrl, { responseType: "json" });
						return statuses.map((status) => toItem(status, date));
					});

					return {
						description: `Local public timeline from ${site}.`,
						item,
						language: "en",
						link: root,
						title: `Mastodon Local Timeline - ${site}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						site: t.String({ description: "Mastodon instance hostname." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch public posts for a hashtag from a Mastodon instance.",
			fulltext: true,
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Hashtag Timeline",
		},
		(app) =>
			app.get(
				"/tag/:site/:hashtag",
				async ({ cache, date, ofetch, params: { hashtag, site } }) => {
					const root = normalizeInstance(site);
					const apiUrl = `${root}/api/v1/timelines/tag/${encodeURIComponent(hashtag)}?limit=20`;
					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const statuses = await ofetch<MastodonStatus[]>(apiUrl, { responseType: "json" });
						return statuses.map((status) => toItem(status, date));
					});

					return {
						description: `Mastodon posts tagged #${hashtag} from ${site}.`,
						item,
						language: "en",
						link: `${root}/tags/${hashtag}`,
						title: `Mastodon Hashtag - ${hashtag}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						hashtag: t.String({ description: "Hashtag without #." }),
						site: t.String({ description: "Mastodon instance hostname." }),
					}),
				},
			),
	);

function normalizeInstance(site: string) {
	return site.startsWith("http") ? site.replace(/\/$/, "") : `https://${site}`;
}

function toItem(status: MastodonStatus, parseDate: (value: string) => Date): DataItem {
	const author = status.account?.display_name || status.account?.username || "Mastodon";
	const description = status.content ?? "";
	return {
		author: [{ name: author }],
		date: parseDate(status.created_at ?? new Date().toISOString()),
		description,
		link: status.url ?? `https://mastodon.social/@${status.account?.username}/${status.id}`,
		title: `${author}: ${description.replaceAll(/<[^>]+>/g, "").slice(0, 80)}`,
	} satisfies DataItem;
}
