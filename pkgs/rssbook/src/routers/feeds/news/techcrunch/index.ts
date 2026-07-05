import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

type TechCrunchPost = {
	content?: { rendered?: string };
	date?: string;
	excerpt?: { rendered?: string };
	link: string;
	title?: { rendered?: string };
};

export default new Source({
	description: "Public WordPress API feeds from TechCrunch.",
	domain: "techcrunch.com",
	slug: "techcrunch",
	title: "TechCrunch",
})
	.feed(
		{
			description: "Fetch latest TechCrunch posts.",
			fulltext: true,
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Latest News",
		},
		(app) =>
			app.get("/news", async ({ cache, date, formatHTML, load, ofetch }) => {
				const apiUrl = "https://techcrunch.com/wp-json/wp/v2/posts?per_page=20";
				const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
					const posts = await ofetch<TechCrunchPost[]>(apiUrl, { responseType: "json" });
					return posts.map((post) => toItem(post, { date, formatHTML, load }));
				});

				return {
					description: "Latest posts from TechCrunch.",
					item,
					language: "en",
					link: "https://techcrunch.com",
					title: "TechCrunch News",
				} satisfies Data;
			}),
	)
	.feed(
		{
			description: "Fetch latest TechCrunch posts from a WordPress category ID.",
			fulltext: true,
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Category",
		},
		(app) =>
			app.get(
				"/category/:categoryId",
				async ({ cache, date, formatHTML, load, ofetch, params: { categoryId } }) => {
					const apiUrl = `https://techcrunch.com/wp-json/wp/v2/posts?per_page=20&categories=${categoryId}`;
					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const posts = await ofetch<TechCrunchPost[]>(apiUrl, { responseType: "json" });
						return posts.map((post) => toItem(post, { date, formatHTML, load }));
					});

					return {
						description: `Latest TechCrunch posts from category ${categoryId}.`,
						item,
						language: "en",
						link: "https://techcrunch.com",
						title: `TechCrunch Category - ${categoryId}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						categoryId: t.String({ description: "WordPress category ID." }),
					}),
				},
			),
	);

function toItem(
	post: TechCrunchPost,
	utils: {
		date: (value: string) => Date;
		formatHTML: (html: string, baseURL?: string) => string;
		load: typeof import("cheerio").load;
	},
): DataItem {
	return {
		content: post.content?.rendered
			? utils.formatHTML(post.content.rendered, post.link)
			: undefined,
		date: utils.date(post.date ?? new Date().toISOString()),
		description: post.excerpt?.rendered
			? utils.load(post.excerpt.rendered).text().trim()
			: undefined,
		link: post.link,
		title: post.title?.rendered ? utils.load(post.title.rendered).text().trim() : post.link,
	} satisfies DataItem;
}
