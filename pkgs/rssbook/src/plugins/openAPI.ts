import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { dataItemSchema, dataSchema, feedType } from "@/types";
import { logger, ofetch } from "@/utils";
import pkg from "../../package.json" with { type: "json" };

const { version } = pkg;

export const openAPIPlugin = (enableFetchOnlineServer: boolean = true) => {
	const servers = [
		{
			description: "Local Server (Default - You can switch to available online server lists.)",
			url: "/",
		},
	];

	// fetch public instance hosts list
	const updateHosts = async () => {
		let onlineList: {
			url: string;
			description: string;
			online: boolean;
		}[] = [];

		try {
			const text = await ofetch(
				"https://raw.githubusercontent.com/HackHTU/RSSBook/refs/heads/main/HOSTS",
				{
					responseType: "text",
				},
			);
			const [, ...lines] = text.trim().split(/\r?\n/);
			onlineList = lines
				.map((line) => line.trim())
				.filter(Boolean)
				.map((line) => {
					const [url = "", description = "", online = "false"] = line.split(",");
					return {
						description: description.trim(),
						online: online.trim().toLowerCase() === "true",
						url: url.trim(),
					};
				})
				.filter((host) => host.url && host.online);
			servers.splice(
				1,
				servers.length,
				...onlineList.map(({ description, url }) => ({ description, url })),
			);
			logger.info(`Loaded ${onlineList.length} online hosts.`);
		} catch {}
	};

	if (enableFetchOnlineServer) {
		// MUST NOT await
		updateHosts();

		// update every 24 hours
		setInterval(updateHosts, 1000 * 60 * 60 * 24);
	}

	return (
		new Elysia({ name: "RSSBook/OpenAPI" })
			.use(
				openapi({
					documentation: {
						info: {
							contact: {
								name: "RSSBook",
								url: "https://github.com/HackHTU/RSSBook",
							},
							description: `
# 📕 RSSBook

Try to browse routes, inspect parameters, and test feeds.

Can't find your feed? **Try making one yourself** and PR it.

Send this prompt to your agent.

\`\`\`plaintext
Clone HackHTU/RSSBook repo and bun install, read create-feeds skill, ask user for new source URL, run source:new script, implement feed and test logic, push to GitHub and create a PR.
\`\`\`
`,
							license: {
								name: "MIT",
								url: "https://github.com/HackHTU/RSSBook/blob/master/LICENSE",
							},
							title: "RSSBook OpenAPI Documentation",
							version: version,
						},
						servers,
						tags: [
							{
								description:
									"Content related to **Anime, Comics, and Games**, including news, reviews, and fan creations.",
								name: "acg",
							},
							{
								description:
									"Online **forums** for discussions, Q&A, and community interactions on various topics.",
								name: "bbs",
							},
							{
								description:
									"Topics covering **graphic design, UI/UX, industrial design**, and creative projects.",
								name: "design",
							},
							{
								description:
									"Information on **financial markets, investments, and personal finance**, including news and analysis.",
								name: "finance",
							},
							{
								description:
									"News, reviews, and discussions about **video games**, esports, and gaming culture.",
								name: "gaming",
							},
							{
								description:
									"Official information, **policies, services, and announcements** from government sources.",
								name: "government",
							},
							{
								description:
									"**Career opportunities, job listings, and professional advice** for job seekers.",
								name: "jobs",
							},
							{
								description:
									"**Live streaming** content including events, shows, and interactive broadcasts.",
								name: "live",
							},
							{
								description:
									"Various **media content**, including videos, audio, images, and interactive media.",
								name: "multimedia",
							},
							{
								description: "**Latest news** and current events from around the world.",
								name: "news",
							},
							{
								description: "Miscellaneous content that does not fit into other categories.",
								name: "others",
							},
							{
								description:
									"Resources, tutorials, and discussions about **coding, software development, and tech projects**.",
								name: "programming",
							},
							{
								description:
									"Books, articles, and **reading materials** for leisure, education, or research.",
								name: "reading",
							},
							{
								description:
									"**Academic, scientific, and technical research** materials and studies.",
								name: "research",
							},
							{
								description:
									"Educational resources, **school-related news**, and learning materials for students and teachers.",
								name: "school",
							},
							{
								description:
									"**E-commerce**, product reviews, and guides for online and offline shopping.",
								name: "shopping",
							},
							{
								description:
									"Content and discussions from **social networking platforms**, trends, and viral posts.",
								name: "socialmedia",
							},
							{
								description:
									"Information and guides for **travel destinations, experiences, and tips**.",
								name: "travel",
							},
							{
								description: "**Announcements and updates** about products, services, or projects.",
								name: "updates",
							},
							{
								description:
									"Personal or professional **blogs** covering various topics, stories, and experiences.",
								name: "blog",
							},
							{
								description:
									"Feed utilities and tools for enhancing the existing RSS/Atom feeds.\n> [!TIP]\n> **You can visit Feed Tools Helper to generate your feed**.",
								name: "utils",
							},
							{
								description:
									"RSSBook related endpoints, including theme, documentation and metadata.",
								name: "_",
							},
						],
					},
					scalar: {
						customCss: `main p,h1,h2,h3,h4,h5,h6,li,img,article,span{opacity:0;transform:translateY(2em);animation:starting-style .6s cubic-bezier(.22,.98,.35,1) forwards}@keyframes starting-style{from{opacity:0;transform:translateY(2em);filter:blur(5px);}to{opacity:1;transform:translateY(0);filter:blur(0);}}@media (prefers-reduced-motion:reduce){main p,h1,h2,h3,h4,h5,h6,li,img,article,span{animation:none;transition:none;opacity:1;transform:none;}}`,
						favicon: "/favicon.ico",
						operationsSorter: "alpha",
						orderSchemaPropertiesBy: "alpha",
						tagsSorter: "alpha",
						theme: "elysiajs",
					},
				}),
			)
			// Use for OpenAPI
			.model({
				dataItemSchema,
				dataSchema,
				feedType,
			})
	);
};
