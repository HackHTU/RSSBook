import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

const BASE_URL = "https://discord.com";
const API_URL = `${BASE_URL}/api/v10`;

const VALID_HAS_TYPES = new Set([
	"link",
	"embed",
	"poll",
	"file",
	"video",
	"image",
	"sound",
	"sticker",
	"snapshot",
]);

type HasType = (typeof VALID_HAS_TYPES extends Set<infer T> ? T : never) & string;

type DiscordAuthor = {
	global_name?: string;
	username: string;
};

type DiscordMessage = {
	attachments?: Array<{ content_type?: string; filename: string; size: number; url: string }>;
	author: DiscordAuthor;
	channel_id: string;
	content: string;
	edited_timestamp?: string;
	embeds?: Array<{ description?: string; title?: string; url?: string }>;
	id: string;
	timestamp: string;
};

type DiscordChannel = {
	guild_id: string;
	name: string;
	topic?: string;
};

type DiscordGuild = {
	icon?: string;
	name: string;
};

type Quest = {
	config: {
		application: { link: string };
		messages: { game_publisher: string; quest_name: string };
		rewards_config: { rewards: Array<{ messages: { name: string } }> };
		starts_at: string;
		task_config: { tasks: Record<string, { event_name: string }> };
	};
	id: string;
};

type SearchResult = {
	messages: DiscordMessage[][];
};

function getAuthorization(meta: {
	config: { DISCORD_AUTHORIZATION?: string };
}): string | undefined {
	return meta.config.DISCORD_AUTHORIZATION?.trim();
}

function missingAuthData(): Data {
	return {
		description:
			"This route requires the DISCORD_AUTHORIZATION config. Provide a valid Discord authorization header to enable it.",
		item: [],
		link: BASE_URL,
		title: "Discord - Authorization Required",
	} satisfies Data;
}

function authorName(author: DiscordAuthor): string {
	return author.global_name ? `${author.global_name} (${author.username})` : author.username;
}

function renderMessageDescription(message: DiscordMessage): string {
	const parts: string[] = [];

	if (message.content) {
		parts.push(`<p>${message.content}</p>`);
	}

	for (const embed of message.embeds ?? []) {
		const embedHtml = `<blockquote><b>${embed.title ?? ""}</b><br>${embed.description ?? ""}</blockquote>`;
		parts.push(embedHtml);
	}

	for (const attachment of message.attachments ?? []) {
		parts.push(
			`<p><a href="${attachment.url}">${attachment.filename}</a> (${attachment.size} bytes)</p>`,
		);
	}

	return parts.join("") || "(no content)";
}

function toMessageItem(message: DiscordMessage, guildId: string, channelId: string): DataItem {
	return {
		author: [{ name: authorName(message.author) }],
		date: new Date(message.timestamp),
		description: renderMessageDescription(message),
		id: message.id,
		link: `${BASE_URL}/channels/${guildId}/${channelId}/${message.id}`,
		title: message.content.split("\n", 1)[0] || "(no content)",
	} satisfies DataItem;
}

export default new Source({
	config: {
		DISCORD_AUTHORIZATION: {
			description: "Discord authorization header from the browser.",
			required: false,
		},
	},
	description: "Discord guild channels, search, and quests via the official REST API v10.",
	domain: "discord.com",
	slug: "discord",
	title: "Discord",
})
	.feed(
		{
			description: "Fetch recent messages from a Discord channel.",
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Channel Messages",
		},
		(app) =>
			app.get(
				"/channel/:channelId",
				async ({ cache, meta, ofetch, params: { channelId } }) => {
					const authorization = getAuthorization(meta);
					if (!authorization) {
						return missingAuthData();
					}

					const cacheKey = `discord:channel:${channelId}`;
					return cache.tryGet<Data>(cacheKey, async () => {
						try {
							const [channelInfo, messages] = await Promise.all([
								ofetch<DiscordChannel>(`${API_URL}/channels/${channelId}`, {
									headers: { authorization },
									responseType: "json",
								}),
								ofetch<DiscordMessage[]>(`${API_URL}/channels/${channelId}/messages`, {
									headers: { authorization },
									query: { limit: 20 },
									responseType: "json",
								}),
							]);

							const guildInfo = await ofetch<DiscordGuild>(
								`${API_URL}/guilds/${channelInfo.guild_id}`,
								{
									headers: { authorization },
									responseType: "json",
								},
							);

							return {
								description: channelInfo.topic,
								image: guildInfo.icon
									? `https://cdn.discordapp.com/icons/${channelInfo.guild_id}/${guildInfo.icon}.webp`
									: undefined,
								item: messages.map((message) =>
									toMessageItem(message, channelInfo.guild_id, channelId),
								),
								link: `${BASE_URL}/channels/${channelInfo.guild_id}/${channelId}`,
								title: `#${channelInfo.name} - ${guildInfo.name} - Discord`,
							} satisfies Data;
						} catch {
							return {
								description:
									"Failed to fetch Discord channel messages. The channel may be inaccessible or the authorization header invalid.",
								item: [],
								link: BASE_URL,
								title: "Discord Channel - Unavailable",
							} satisfies Data;
						}
					});
				},
				{
					params: t.Object({
						channelId: t.String({ description: "Discord channel ID." }),
					}),
				},
			),
	)
	.feed(
		{
			description:
				"Search messages in a Discord guild. Pass search parameters as a query string in the route, e.g. `content=friendly&has=image,video`.",
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Guild Search",
		},
		(app) =>
			app.get(
				"/search/:guildId/:routeParams",
				async ({ meta, ofetch, params: { guildId, routeParams } }) => {
					const authorization = getAuthorization(meta);
					if (!authorization) {
						return missingAuthData();
					}

					const parsed = new URLSearchParams(routeParams);
					const hasTypes = parsed
						.get("has")
						?.split(",")
						.filter(Boolean)
						.filter((type): type is HasType => VALID_HAS_TYPES.has(type as HasType));

					const query: Record<string, string | string[] | boolean | undefined> = {
						author_id: parsed.get("author_id") ?? undefined,
						channel_id: parsed.get("channel_id") ?? undefined,
						content: parsed.get("content") ?? undefined,
						has: hasTypes?.length ? hasTypes : undefined,
						max_id: parsed.get("max_id") ?? undefined,
						mentions: parsed.get("mentions") ?? undefined,
						min_id: parsed.get("min_id") ?? undefined,
						pinned: parsed.has("pinned") ? parsed.get("pinned") === "true" : undefined,
					};

					const searchDesc = Object.entries(query)
						.filter(([, value]) => value !== undefined)
						.map(([key, value]) => `${key}:${Array.isArray(value) ? value.join(",") : value}`)
						.join(" ");

					if (!searchDesc) {
						return {
							description: "At least one valid search parameter is required.",
							item: [],
							link: `${BASE_URL}/channels/${guildId}`,
							title: "Discord Search - Invalid Parameters",
						} satisfies Data;
					}

					try {
						const [guildInfo, searchResult] = await Promise.all([
							ofetch<DiscordGuild>(`${API_URL}/guilds/${guildId}`, {
								headers: { authorization },
								responseType: "json",
							}),
							ofetch<SearchResult>(`${API_URL}/guilds/${guildId}/messages/search`, {
								headers: { authorization },
								query,
								responseType: "json",
							}),
						]);

						const messages = searchResult.messages.flat();

						return {
							item: messages.map((message) => toMessageItem(message, guildId, message.channel_id)),
							link: `${BASE_URL}/channels/${guildId}`,
							title: `Search "${searchDesc}" in ${guildInfo.name} - Discord`,
						} satisfies Data;
					} catch {
						return {
							description:
								"Failed to search Discord guild messages. The guild may be inaccessible or the authorization header invalid.",
							item: [],
							link: `${BASE_URL}/channels/${guildId}`,
							title: "Discord Search - Unavailable",
						} satisfies Data;
					}
				},
				{
					params: t.Object({
						guildId: t.String({ description: "Discord guild ID." }),
						routeParams: t.String({
							description:
								"Search parameters as a query string. Supported: content, author_id, mentions, has, min_id, max_id, channel_id, pinned.",
						}),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch available Discord quests.",
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Quests",
		},
		(app) =>
			app.get("/quests", async ({ cache, meta, ofetch }) => {
				const authorization = getAuthorization(meta);
				if (!authorization) {
					return missingAuthData();
				}

				return cache.tryGet<Data>("discord:quests", async () => {
					try {
						const response = await ofetch<{ quests: Quest[] }>(`${API_URL}/quests/@me`, {
							headers: { authorization },
							responseType: "json",
						});

						return {
							item: response.quests.map((quest) => {
								const tasks = Object.values(quest.config.task_config.tasks).map(
									(task) => task.event_name,
								);
								const reward = quest.config.rewards_config.rewards[0];

								return {
									author: [{ name: quest.config.messages.game_publisher }],
									date: new Date(quest.config.starts_at),
									description: tasks.join(", "),
									id: quest.id,
									link: quest.config.application.link.split("?", 1)[0],
									title: `${quest.config.messages.quest_name} - Claim ${reward?.messages.name ?? ""}`,
								} satisfies DataItem;
							}),
							link: `${BASE_URL}/quest-home`,
							title: "Available Quests - Discord",
						} satisfies Data;
					} catch {
						return {
							description:
								"Failed to fetch Discord quests. The authorization header may be invalid.",
							item: [],
							link: `${BASE_URL}/quest-home`,
							title: "Discord Quests - Unavailable",
						} satisfies Data;
					}
				});
			}),
	);
