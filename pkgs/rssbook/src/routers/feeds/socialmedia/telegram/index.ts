import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

const BASE_URL = "https://t.me";

type CheerioAPI = ReturnType<typeof import("@/utils")["load"]>;
type CheerioItem = ReturnType<CheerioAPI>;

function extractBackgroundImageUrl(style?: string): string | undefined {
	const match = style?.match(/url\(['"]?(.*?)['"]?\)/);
	return match?.[1];
}

function buildMessageDescription($: CheerioAPI, item: CheerioItem): string {
	const parts: string[] = [];

	const textHtml = item.find(".tgme_widget_message_text").html();
	if (textHtml) {
		parts.push(textHtml);
	}

	item.find(".tgme_widget_message_photo_wrap").each((_, el) => {
		const url = extractBackgroundImageUrl($(el).css("background-image"));
		if (url) {
			parts.push(`<p><img src="${url}"></p>`);
		}
	});

	item.find(".tgme_widget_message_video_player").each((_, el) => {
		const $el = $(el);
		const videoUrl = $el.find(".tgme_widget_message_video").attr("src");
		const thumbUrl = extractBackgroundImageUrl(
			$el.find(".tgme_widget_message_video_thumb").css("background-image"),
		);
		if (videoUrl) {
			parts.push(
				`<p><video src="${videoUrl}"${thumbUrl ? ` poster="${thumbUrl}"` : ""} controls></video></p>`,
			);
		}
	});

	item.find("audio.tgme_widget_message_voice").each((_, el) => {
		const url = $(el).attr("src");
		if (url) {
			parts.push(`<p><audio src="${url}" controls></audio></p>`);
		}
	});

	const pollQuestion = item.find(".tgme_widget_message_poll_question").text();
	const pollType = item.find(".tgme_widget_message_poll_type").text();
	if (pollQuestion && pollType) {
		let pollHtml = `<p><b>${pollQuestion}</b></p><p><small>${pollType}</small></p>`;
		item.find(".tgme_widget_message_poll_option").each((_, el) => {
			const $el = $(el);
			const percent = $el.find(".tgme_widget_message_poll_option_percent").text();
			const text = $el.find(".tgme_widget_message_poll_option_text").text();
			if (percent && text) {
				pollHtml += `<p><b>${percent}</b> - ${text}</p>`;
			}
		});
		parts.push(`<blockquote>${pollHtml}</blockquote>`);
	}

	item.find(".tgme_widget_message_document_wrap").each((_, el) => {
		const $el = $(el);
		const title = $el.find(".tgme_widget_message_document_title").text();
		const extra = $el.find(".tgme_widget_message_document_extra").text();
		if (title || extra) {
			parts.push(`<blockquote><p><b>${title}</b></p><p><small>${extra}</small></p></blockquote>`);
		}
	});

	return parts.join("");
}

function buildMessageTitle(item: CheerioItem, description: string, date: Date): string {
	const text = item.find(".tgme_widget_message_text").text().split("\n", 1)[0]?.trim() ?? "";
	return text || description.replace(/<[^>]+>/g, "").slice(0, 80) || date.toUTCString();
}

export default new Source({
	description: "Telegram public channel posts scraped from the t.me web preview.",
	domain: "t.me",
	slug: "telegram",
	title: "Telegram",
}).feed(
	{
		description:
			"Fetch public posts from a Telegram channel via the web preview at t.me/s/:username. Optionally append a search query as the second path parameter.",
		language: "en",
		maintainer: { name: "RSSBook" },
		title: "Channel",
	},
	(app) =>
		app.get(
			"/channel/:username/:routeParams?",
			async ({ cache, formatHTML, load, ofetch, params: { username, routeParams } }) => {
				const resourceUrl = routeParams
					? `${BASE_URL}/s/${username}?q=${encodeURIComponent(routeParams)}`
					: `${BASE_URL}/s/${username}`;

				return cache.tryGet<Data>(resourceUrl, async () => {
					const html = await ofetch(resourceUrl, { responseType: "text" });
					const $ = load(html);

					$("a[onclick][href]").each((_, el) => {
						const href = $(el).attr("href");
						if (href) {
							$(el).attr("href", href.replaceAll("&amp;", "&"));
						}
					});

					const channelName = $(".tgme_channel_info_header_title").text().trim();
					const channelDescription = $(".tgme_channel_info_description").text().trim();

					const list = $(".tgme_widget_message_wrap:not(:has(.tme_no_messages_found))");

					if (list.length === 0 && $(".tgme_channel_history").length === 0) {
						return {
							description: `Unable to fetch messages from ${username}. The channel may be private, restricted, or not available via the web preview.`,
							item: [],
							link: resourceUrl,
							title: `${username} - Telegram Channel`,
						} satisfies Data;
					}

					const items = list
						.toArray()
						.map((el) => {
							const $item = $(el);
							const datetime = $item.find(".tgme_widget_message_date time").attr("datetime");
							const link = $item.find(".tgme_widget_message_date").attr("href");
							if (!datetime || !link) {
								return null;
							}

							const date = new Date(datetime);
							const rawDescription = buildMessageDescription($, $item);
							const description = formatHTML(rawDescription, resourceUrl);
							const title = buildMessageTitle($item, description, date);

							return {
								author: [
									{
										name:
											$item.find(".tgme_widget_message_from_author").text().trim() || channelName,
									},
								],
								date,
								description,
								link,
								title,
							} satisfies DataItem;
						})
						.filter((item) => item !== null)
						.toReversed() as DataItem[];

					return {
						description: channelDescription,
						image: $(".tgme_page_photo_image > img").attr("src"),
						item: items,
						link: resourceUrl,
						title: `${routeParams ? `"${routeParams}" - ` : ""}${channelName || username} - Telegram Channel`,
					} satisfies Data;
				});
			},
			{
				params: t.Object({
					routeParams: t.Optional(t.String({ description: "Optional search query." })),
					username: t.String({ description: "Telegram channel username." }),
				}),
			},
		),
);
