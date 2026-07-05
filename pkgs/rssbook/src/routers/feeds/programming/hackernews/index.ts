import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

const SECTION_URLS: Record<string, string> = {
	best: "beststories",
	newest: "newstories",
	news: "topstories",
};

type HackerNewsItem = {
	by?: string;
	id: number;
	score?: number;
	text?: string;
	time?: number;
	title?: string;
	url?: string;
};

type HackerNewsUser = {
	about?: string;
	created?: number;
	karma?: number;
	submitted?: number[];
};

export default new Source({
	description: "Stories and submissions from Hacker News.",
	domain: "news.ycombinator.com",
	slug: "hackernews",
	title: "Hacker News",
})
	.feed(
		{
			description: "Fetch stories submitted by a Hacker News user.",
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "User Submissions",
		},
		(app) =>
			app.get(
				"/submitted/:user",
				async ({ cache, date, ofetch, params: { user } }) => {
					const userUrl = `https://hacker-news.firebaseio.com/v0/user/${user}.json`;
					const link = `https://news.ycombinator.com/submitted?id=${user}`;

					const item = await cache.tryGet<DataItem[]>(userUrl, async () => {
						const profile = await ofetch<HackerNewsUser>(userUrl, { responseType: "json" });
						const ids = profile.submitted?.slice(0, 30) ?? [];
						const stories = await Promise.all(
							ids.map((id) =>
								ofetch<HackerNewsItem>(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
									responseType: "json",
								}),
							),
						);

						return stories
							.filter((story): story is HackerNewsItem & { title: string } => Boolean(story?.title))
							.map((story) => ({
								author: story.by ? [{ name: story.by }] : undefined,
								date: date((story.time ?? Date.now() / 1000) * 1000),
								description: story.text,
								link: story.url ?? `https://news.ycombinator.com/item?id=${story.id}`,
								title: story.title,
							})) satisfies DataItem[];
					});

					return {
						description: `Hacker News submissions by ${user}.`,
						item,
						language: "en",
						link,
						title: `Hacker News Submissions - ${user}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						user: t.String({ description: "Hacker News username." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch stories from a Hacker News section.",
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Section Stories",
		},
		(app) =>
			app.get(
				"/:section",
				async ({ cache, date, ofetch, params: { section } }) => {
					const storyType = SECTION_URLS[section] ?? SECTION_URLS.news;
					const apiUrl = `https://hacker-news.firebaseio.com/v0/${storyType}.json`;
					const link = `https://news.ycombinator.com/${section === "news" ? "news" : section}`;
					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const storyIds = await ofetch<number[]>(apiUrl, { responseType: "json" });
						const stories = await Promise.all(
							storyIds.slice(0, 20).map((id) =>
								ofetch<HackerNewsItem>(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
									responseType: "json",
								}),
							),
						);

						return stories.map(
							(story) =>
								({
									author: story.by ? [{ name: story.by }] : undefined,
									date: date((story.time ?? Date.now() / 1000) * 1000),
									description: story.score ? `${story.score} points` : undefined,
									link: story.url ?? `https://news.ycombinator.com/item?id=${story.id}`,
									title: story.title ?? "Hacker News Story",
								}) satisfies DataItem,
						);
					});

					return {
						description: `Hacker News ${section} stories.`,
						item,
						language: "en",
						link,
						title: `Hacker News - ${section}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						section: t.String({ default: "news", description: "Section: news, newest, or best." }),
					}),
				},
			),
	);
