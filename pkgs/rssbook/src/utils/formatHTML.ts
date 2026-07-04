import sanitizeHTML from "sanitize-html";
import { toAbsoluteURL } from "./toAbsoluteURL";

const DEFAULT_OPTIONS: sanitizeHTML.IOptions = {
	allowedAttributes: {
		"*": ["id", "lang", "dir", "title"],
		a: ["href", "name", "target", "rel", "download"],
		audio: ["src", "controls", "autoplay", "loop", "muted", "preload"],
		img: ["src", "srcset", "alt", "title", "loading", "sizes"],
		picture: [],
		source: ["src", "srcset", "type", "media", "sizes"],
		track: ["src", "kind", "srclang", "label", "default"],
		video: [
			"src",
			"poster",
			"width",
			"height",
			"controls",
			"autoplay",
			"loop",
			"muted",
			"playsinline",
			"preload",
		],
	},

	allowedSchemes: ["http", "https", "ftp", "mailto", "tel", "data"],
	allowedSchemesAppliedToAttributes: ["href", "src", "cite", "poster"],
	allowedSchemesByTag: {},
	allowedTags: [
		"address",
		"article",
		"aside",
		"footer",
		"header",
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		"hgroup",
		"main",
		"nav",
		"section",
		"blockquote",
		"dd",
		"div",
		"dl",
		"dt",
		"figcaption",
		"figure",
		"hr",
		"li",
		"ol",
		"p",
		"pre",
		"ul",

		"a",
		"abbr",
		"b",
		"bdi",
		"bdo",
		"br",
		"cite",
		"code",
		"data",
		"dfn",
		"em",
		"i",
		"kbd",
		"mark",
		"q",
		"rb",
		"rp",
		"rt",
		"rtc",
		"ruby",
		"s",
		"samp",
		"small",
		"span",
		"strong",
		"sub",
		"sup",
		"time",
		"u",
		"var",
		"wbr",

		"caption",
		"col",
		"colgroup",
		"table",
		"tbody",
		"td",
		"tfoot",
		"th",
		"thead",
		"tr",

		"img",
		"picture",
		"source",
		"video",
		"audio",
		"track",
	],
	allowProtocolRelative: true,

	disallowedTagsMode: "discard",
	enforceHtmlBoundary: false,

	nonBooleanAttributes: [
		"abbr",
		"accept",
		"accept-charset",
		"accesskey",
		"action",
		"allow",
		"alt",
		"as",
		"autocapitalize",
		"autocomplete",
		"blocking",
		"charset",
		"cite",
		"class",
		"color",
		"cols",
		"colspan",
		"content",
		"contenteditable",
		"coords",
		"crossorigin",
		"data",
		"datetime",
		"decoding",
		"dir",
		"dirname",
		"download",
		"draggable",
		"enctype",
		"enterkeyhint",
		"fetchpriority",
		"for",
		"form",
		"formaction",
		"formenctype",
		"formmethod",
		"formtarget",
		"headers",
		"height",
		"hidden",
		"high",
		"href",
		"hreflang",
		"http-equiv",
		"id",
		"imagesizes",
		"imagesrcset",
		"inputmode",
		"integrity",
		"is",
		"itemid",
		"itemprop",
		"itemref",
		"itemtype",
		"kind",
		"label",
		"lang",
		"list",
		"loading",
		"low",
		"max",
		"maxlength",
		"media",
		"method",
		"min",
		"minlength",
		"name",
		"nonce",
		"optimum",
		"pattern",
		"ping",
		"placeholder",
		"popover",
		"popovertarget",
		"popovertargetaction",
		"poster",
		"preload",
		"referrerpolicy",
		"rel",
		"rows",
		"rowspan",
		"sandbox",
		"scope",
		"shape",
		"size",
		"sizes",
		"slot",
		"span",
		"spellcheck",
		"src",
		"srcdoc",
		"srclang",
		"srcset",
		"start",
		"step",
		"tabindex",
		"target",
		"title",
		"translate",
		"type",
		"usemap",
		"value",
		"width",
		"wrap",
		"controls",
		"autoplay",
		"loop",
		"muted",
		"playsinline",
	],

	parseStyleAttributes: false,

	selfClosing: [
		"img",
		"br",
		"hr",
		"area",
		"base",
		"basefont",
		"input",
		"link",
		"meta",
		"source",
		"track",
	],
};

function getOptionsWithURLTransform(baseUrl?: string): sanitizeHTML.IOptions {
	if (!baseUrl) {
		return DEFAULT_OPTIONS;
	}

	return {
		...DEFAULT_OPTIONS,

		// transform relative URLs to absolute URLs
		transformTags: {
			a: (tagName: string, attribs: sanitizeHTML.Attributes) => {
				if (attribs.href) {
					attribs.href = toAbsoluteURL(attribs.href, baseUrl);
				}
				return { attribs, tagName };
			},
			audio: (tagName: string, attribs: sanitizeHTML.Attributes) => {
				if (attribs.src) {
					attribs.src = toAbsoluteURL(attribs.src, baseUrl);
				}
				return { attribs, tagName };
			},
			img: (tagName: string, attribs: sanitizeHTML.Attributes) => {
				if (attribs.src) {
					attribs.src = toAbsoluteURL(attribs.src, baseUrl);
				}
				if (attribs.srcset) {
					attribs.srcset = attribs.srcset
						.split(",")
						.map((src: string) => {
							const parts = src.trim().split(/\s+/);
							if (parts[0]) {
								parts[0] = toAbsoluteURL(parts[0], baseUrl);
							}
							return parts.join(" ");
						})
						.join(", ");
				}
				return { attribs, tagName };
			},
			source: (tagName: string, attribs: sanitizeHTML.Attributes) => {
				if (attribs.src) {
					attribs.src = toAbsoluteURL(attribs.src, baseUrl);
				}
				if (attribs.srcset) {
					attribs.srcset = attribs.srcset
						.split(",")
						.map((src: string) => {
							const parts = src.trim().split(/\s+/);
							if (parts[0]) {
								parts[0] = toAbsoluteURL(parts[0], baseUrl);
							}
							return parts.join(" ");
						})
						.join(", ");
				}
				return { attribs, tagName };
			},
			track: (tagName: string, attribs: sanitizeHTML.Attributes) => {
				if (attribs.src) {
					attribs.src = toAbsoluteURL(attribs.src, baseUrl);
				}
				return { attribs, tagName };
			},
			video: (tagName: string, attribs: sanitizeHTML.Attributes) => {
				if (attribs.src) {
					attribs.src = toAbsoluteURL(attribs.src, baseUrl);
				}
				if (attribs.poster) {
					attribs.poster = toAbsoluteURL(attribs.poster, baseUrl);
				}
				return { attribs, tagName };
			},
		},
	};
}

/**
 * Format HTML and sanitize it.
 *
 * Sanitize HTML and convert relative URLs to absolute URLs based on the provided baseURL.
 *
 * @param html html string to format
 * @param baseURL optional base URL for resolving relative URLs
 * @param option sanitize-html options
 * @returns formatted HTML string
 */
export function formatHTML(html: string, baseURL?: string, option?: sanitizeHTML.IOptions): string {
	const finalOptions = option || getOptionsWithURLTransform(baseURL);
	return sanitizeHTML(html, finalOptions);
}
