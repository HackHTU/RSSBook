import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

const DYNAMIC_CARD_SELECTOR = ".bili-dyn-list__item";
const CONTENT_SELECTORS = [
	".bili-rich-text",
	".opus-paragraph-children",
	".bili-dyn-content__orig__desc",
	".bili-dyn-card-video__desc",
	".dyn-card-opus__summary",
];

function normalizeURL(value: string | undefined, baseURL: string): string | undefined {
	if (!value) return undefined;
	if (value.startsWith("//")) return `https:${value}`;

	try {
		return new URL(value, baseURL).toString();
	} catch {
		return undefined;
	}
}

function normalizeText(value: string | undefined): string {
	return (value ?? "").replace(/\s+/g, " ").trim();
}

function escapeHTML(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

function parseBilibiliDate(value: string, parseDate: (value: string) => Date): Date {
	const match = value.match(/\d{4}年\d{1,2}月\d{1,2}日/);
	if (!match) return parseDate(value);

	const [year, month, day] = match[0].match(/\d+/g) ?? [];
	return parseDate(`${year}-${month?.padStart(2, "0")}-${day?.padStart(2, "0")}T00:00:00+08:00`);
}

function isContentImage(url: string): boolean {
	return url.includes("/bfs/new_dyn/") || url.includes("/bfs/archive/");
}

function buildDescription(
	text: string,
	images: string[],
	formatHTML: (html: string) => string,
): string {
	const imageHTML = images.map(
		(image) => `<p><img src="${escapeHTML(image)}" referrerpolicy="no-referrer"></p>`,
	);
	return formatHTML([text ? `<p>${escapeHTML(text)}</p>` : "", ...imageHTML].join(""));
}

export default new Source({
	description: "Rendered browser examples for pages that require JavaScript.",
	domain: "bilibili.com",
	slug: "browser",
	title: "Browser Rendered Feeds",
}).feed(
	{
		browser: true,
		description: "Render a Bilibili user space dynamic page and build an RSS feed from cards.",
		fulltext: true,
		language: "zh-CN",
		maintainer: { name: "RSSBook" },
		title: "Bilibili Space Dynamics",
		withImage: "If-Present",
	},
	(app) =>
		app.get(
			"/bilibili/space/:mid/dynamic",
			async ({ browser, cache, date, formatHTML, load, params: { mid } }) => {
				const link = `https://space.bilibili.com/${mid}/dynamic`;

				const html = await cache.tryGet(link, () =>
					browser.withPage(async (page) => {
						await page.goto(link, { waitUntil: "networkidle2" });
						await page.waitForSelector(DYNAMIC_CARD_SELECTOR, { timeout: 15_000 }).catch(() => {});
						return page.content();
					}),
				);
				const $ = load(html);
				const profileName = normalizeText(
					$(".h-name, .n-name, .nickname, .username").first().text(),
				);

				const item = $(DYNAMIC_CARD_SELECTOR)
					.toArray()
					.map((element, index) => {
						const card = $(element);
						const author =
							normalizeText(card.find(".bili-dyn-title__text, .bili-dyn-name").first().text()) ||
							profileName ||
							`Bilibili ${mid}`;
						const rawDate = normalizeText(card.find(".bili-dyn-time").first().text());
						const text =
							CONTENT_SELECTORS.map((selector) =>
								normalizeText(card.find(selector).first().text()),
							).find(Boolean) || "Bilibili dynamic";
						const videoLink = normalizeURL(
							card.find("a.bili-dyn-card-video[href]").first().attr("href"),
							link,
						);
						const images = card
							.find("img")
							.toArray()
							.map((image) => normalizeURL($(image).attr("src") || $(image).attr("data-src"), link))
							.filter((url): url is string => typeof url === "string" && isContentImage(url));
						const itemLink = videoLink ?? `${link}#dynamic-${index + 1}`;
						const title = text.length > 80 ? `${text.slice(0, 80)}...` : text;

						return {
							author: [{ name: author }],
							date: parseBilibiliDate(rawDate, date),
							description: buildDescription(text, images, formatHTML),
							id: `${mid}:${rawDate || index}:${videoLink ?? images[0] ?? title}`,
							image: images[0],
							link: itemLink,
							title,
							video: videoLink,
						} satisfies DataItem;
					})
					.filter((item) => item.title && item.link);

				return {
					description: `Bilibili space dynamic feed for ${profileName || mid}.`,
					item,
					language: "zh-CN",
					link,
					title: `${profileName || mid} - Bilibili Dynamics`,
				} satisfies Data;
			},
			{
				params: t.Object({
					mid: t.String({
						description: "Bilibili user space id, for example 50.",
						examples: ["50"],
					}),
				}),
			},
		),
);
