import type { Data, DataItem } from "@/types";
import { Source } from "@/utils";

type DoubanMovie = {
	actors?: Array<{ name?: string }>;
	cover_url?: string;
	directors?: Array<{ name?: string }>;
	genres?: string[];
	intro?: string;
	pubdate?: string[];
	title?: string;
	url?: string;
};

type DoubanBook = {
	card_subtitle?: string;
	cards?: Array<{ content?: string }>;
	null_rating_reason?: string;
	pic?: { normal?: string };
	rating?: { value?: string };
	title?: string;
	url?: string;
};

export default new Source({
	description: "Public API feeds from Douban (豆瓣).",
	domain: "douban.com",
	slug: "douban",
	title: "Douban",
})
	.feed(
		{
			description: "Fetch coming-soon movies from Douban Movie.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Coming Movies",
		},
		(app) =>
			app.get("/movie/coming", async ({ cache, date, ofetch }) => {
				const link = "https://movie.douban.com/coming";
				const apiUrl = "https://m.douban.com/rexxar/api/v2/movie/coming_soon";
				const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
					const response = await ofetch<{ subjects?: DoubanMovie[] }>(apiUrl, {
						headers: {
							Referer: "https://m.douban.com/movie/",
						},
						responseType: "json",
					});

					return (response.subjects ?? []).map((movie) => {
						const description = [
							movie.intro,
							movie.pubdate?.join(", "),
							movie.directors
								?.map((person) => person.name)
								.filter(Boolean)
								.join(", "),
							movie.actors
								?.map((person) => person.name)
								.filter(Boolean)
								.join(", "),
						]
							.filter(Boolean)
							.join("<br>");

						return {
							category: movie.genres?.map((name) => ({ name })),
							date: date(new Date()),
							description,
							image: movie.cover_url,
							link: movie.url ?? link,
							title: movie.title ?? "Douban Movie",
						} satisfies DataItem;
					});
				});

				return {
					description: "Coming-soon movies from Douban Movie.",
					item,
					language: "zh-CN",
					link,
					title: "Douban Coming Movies",
				} satisfies Data;
			}),
	)
	.feed(
		{
			description: "Fetch latest books from Douban Books.",
			language: "zh-CN",
			maintainer: { name: "RSSBook" },
			title: "Latest Books",
		},
		(app) =>
			app.get("/book/latest", async ({ cache, date, ofetch }) => {
				const link = "https://book.douban.com/latest";
				const apiUrl =
					"https://m.douban.com/rexxar/api/v2/subject_collection/new_book_all/items?start=0&count=20&mode=collection&for_mobile=1";
				const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
					const response = await ofetch<{ items?: DoubanBook[] }>(apiUrl, {
						headers: {
							Referer: "https://m.douban.com/book/",
						},
						responseType: "json",
					});

					return (response.items ?? []).map((book) => {
						const rating = book.rating?.value
							? `${book.rating.value} points`
							: book.null_rating_reason;
						return {
							date: date(new Date()),
							description: [book.card_subtitle, book.cards?.[0]?.content, rating]
								.filter(Boolean)
								.join("<br>"),
							image: book.pic?.normal,
							link: book.url ?? link,
							title: book.title ?? "Douban Book",
						} satisfies DataItem;
					});
				});

				return {
					description: "Latest books from Douban Books.",
					item,
					language: "zh-CN",
					link,
					title: "Douban Latest Books",
				} satisfies Data;
			}),
	);
