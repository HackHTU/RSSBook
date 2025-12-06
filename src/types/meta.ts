export interface Meta {
	/** <title> */
	title?: string;

	/** <meta name="description"> */
	description?: string;

	/** <meta name="keywords"> */
	keywords?: string | string[];

	/** <html lang="..."> */
	lang?: string;

	/** Favicon  */
	favicon?: string;

	/** Apple Touch Icon */
	appleTouchIcon?: string;

	/** OG（OpenGraph） */
	og?: {
		title?: string;
		description?: string;
		type?: string;
		url?: string;
		image?: string;
		siteName?: string;
	};

	/** Twitter Card  */
	twitter?: {
		card?: string; // summary、summary_large_image
		title?: string;
		description?: string;
		image?: string;
		site?: string; // @yourtwitter
	};

	rssFeed?: string;
	atomFeed?: string;
	jsonFeed?: string;

	extra?: Array<{
		name?: string;
		property?: string;
		content: string;
	}>;
}
