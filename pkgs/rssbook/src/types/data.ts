import { getSchemaValidator, type Static, t } from "elysia";

export const languageCodes = [
	"af",
	"ar-DZ",
	"ar-IQ",
	"ar-KW",
	"ar-MA",
	"ar-SA",
	"ar-TN",
	"be",
	"bg",
	"ca",
	"cs",
	"da",
	"de",
	"de-AT",
	"de-CH",
	"de-DE",
	"de-LI",
	"de-LU",
	"el",
	"en",
	"en-AU",
	"en-BZ",
	"en-CA",
	"en-GB",
	"en-IE",
	"en-JM",
	"en-NZ",
	"en-PH",
	"en-TT",
	"en-US",
	"en-ZA",
	"en-ZW",
	"es",
	"es-AR",
	"es-BO",
	"es-CL",
	"es-CO",
	"es-CR",
	"es-DO",
	"es-EC",
	"es-ES",
	"es-GT",
	"es-HN",
	"es-MX",
	"es-NI",
	"es-PA",
	"es-PE",
	"es-PR",
	"es-PY",
	"es-SV",
	"es-UY",
	"es-VE",
	"et",
	"eu",
	"fi",
	"fo",
	"fr",
	"fr-BE",
	"fr-CA",
	"fr-CH",
	"fr-FR",
	"fr-LU",
	"fr-MC",
	"ga",
	"gd",
	"gl",
	"haw",
	"hi",
	"hr",
	"hu",
	"id",
	"is",
	"it",
	"it-CH",
	"it-IT",
	"ja",
	"ko",
	"mk",
	"ne",
	"nl",
	"nl-BE",
	"nl-NL",
	"no",
	"pl",
	"pt",
	"pt-BR",
	"pt-PT",
	"ro",
	"ro-MD",
	"ro-RO",
	"ru",
	"ru-MD",
	"ru-RU",
	"sk",
	"sl",
	"sq",
	"sr",
	"sv",
	"sv-FI",
	"sv-SE",
	"tr",
	"uk",
	"zh",
	"zh-CN",
	"zh-HK",
	"zh-TW",
	"other",
] as const;
export type Language = (typeof languageCodes)[number];

/**
 * Enclosure
 */
export const EnclosureSchema = t.Object({
	duration: t.Optional(
		t.Number({
			description: "Duration in seconds.",
		}),
	),
	length: t.Optional(
		t.Number({
			description: "Size of the resource in bytes, if provided by the feed.",
		}),
	),
	title: t.Optional(
		t.String({
			description: "Optional human-readable title for the enclosure.",
		}),
	),
	type: t.Optional(
		t.String({
			description: 'MIME type of the enclosure resource (e.g. "audio/mpeg", "image/png").',
		}),
	),
	url: t.String({
		description:
			"Absolute URL to the enclosure resource. Typically required for playback or download.",
	}),
});
export type Enclosure = Static<typeof EnclosureSchema>;

/**
 * Author
 */
export const AuthorSchema = t.Object({
	avatar: t.Optional(
		t.String({ description: "URL to an avatar or profile image for the author." }),
	),
	email: t.Optional(t.String({ description: "Contact email address." })),
	link: t.Optional(t.String({ description: "URL pointing to the author's homepage or profile." })),
	name: t.Optional(t.String({ description: "Full name of the author/contributor." })),
});
export type Author = Static<typeof AuthorSchema>;

/**
 * Category
 */
export const CategorySchema = t.Object({
	domain: t.Optional(t.String({ description: "Domain or namespace for the category." })),
	name: t.Optional(t.String({ description: "The human-readable category name or tag." })),
	scheme: t.Optional(
		t.String({ description: "Scheme or classification URI associated with the category." }),
	),
	term: t.Optional(t.String({ description: "Term identifier for the category." })),
});
export type Category = Static<typeof CategorySchema>;

export const dataItemSchema = t.Object(
	{
		audio: t.Optional(
			t.Union([t.String({ description: "URL to the audio for the item." }), EnclosureSchema]),
		),
		author: t.Optional(t.Array(AuthorSchema)),
		category: t.Optional(t.Array(CategorySchema)),
		content: t.Optional(t.String({ description: "Main content for the item (HTML or text)." })),
		date: t.Date({
			default: new Date(),
			description: "Publication date.",
		}),
		description: t.Optional(t.String({ description: "Short summary or excerpt for the item." })),
		enclosure: t.Optional(EnclosureSchema),
		extensions: t.Optional(
			t.Array(
				t.Object({
					name: t.String(),
					objects: t.Any(),
				}),
			),
		),
		id: t.Optional(
			t.String({
				description: "Optional stable identifier for the item.",
			}),
		),
		image: t.Optional(
			t.Union([t.String({ description: "URL to the image for the item." }), EnclosureSchema]),
		),
		link: t.String({
			description: "Canonical URL for the item.",
			format: "uri",
		}),
		published: t.Optional(
			t.Date({
				description:
					"Optional published date.When both `date` and `published` are present, they may represent different semantics depending on the feed format.",
			}),
		),
		title: t.String({ description: "The human-readable title of the item." }),
		video: t.Optional(
			t.Union([t.String({ description: "URL to the video for the item." }), EnclosureSchema]),
		),
	},
	{
		description: "An individual item within the feed.",
		title: "Feed Data Item Schema",
	},
);
export type DataItem = Static<typeof dataItemSchema>;

export const dataSchema = t.Object(
	{
		author: t.Optional(AuthorSchema),
		category: t.Optional(t.String()),
		copyright: t.Optional(t.String({ description: "Copyright notice for the feed content." })),
		description: t.Optional(
			t.String({
				description: "Short description or subtitle for the feed.",
			}),
		),
		favicon: t.Optional(
			t.String({
				description: "URL to a small icon for the feed.",
				format: "uri",
			}),
		),
		id: t.Optional(
			t.String({
				description: "Optional stable identifier for the feed itself.",
			}),
		),
		image: t.Optional(
			t.String({ description: "URL to a main image for the feed.", format: "uri" }),
		),
		item: t.Optional(t.Array(dataItemSchema)),
		language: t.Optional(
			t.UnionEnum(languageCodes, {
				description: "Language code for the feed.",
			}),
		),
		link: t.String({
			default: "",
			description: "Canonical website link for the feed.",
			format: "uri",
		}),
		podcast: t.Optional(
			t.Boolean({
				description: "Whether the feed is a podcast (enables podcast-specific tags).",
			}),
		),
		title: t.String({
			default: "No title",
			description: "Human-readable title of the feed (site name or podcast title).",
		}),
		ttl: t.Optional(
			t.Number({
				description: "Time-to-live (TTL) for the feed in minutes.",
			}),
		),
		updated: t.Optional(
			t.Date({
				description: "Date when the feed was last updated (ISO 8601 string).",
			}),
		),
	},
	{
		description: "The overall feed data structure containing metadata and items.",
		title: "Feed Data Schema",
	},
);
export type Data = Static<typeof dataSchema>;
export const dataValidator = getSchemaValidator(dataSchema);

export function validateData(obj: unknown): obj is Data {
	return dataValidator.Check(obj);
}

export function parseData(obj: unknown): Data {
	const result = dataValidator.safeParse(obj);

	if (!result.success) {
		throw new Error(`Data Validation Error: ${result.error}`);
	}
	return {
		...EMPTY_DATA,
		...result.data,
	};
}

export const EMPTY_DATA: Data = {
	description: "",
	item: [],
	link: "https://github.com/HackHTU/RSSBook",
	title: "No title",
};

export const allFeedTypes = ["rss", "atom", "json", "raw"] as const;
export const feedType = t.UnionEnum(allFeedTypes, {
	description: "The output type of feed format.",
	title: "Supported Feed Type",
});
export type FeedType = Static<typeof feedType>;
export function isFeedType(type: string): type is FeedType {
	return (allFeedTypes as readonly string[]).includes(type);
}
