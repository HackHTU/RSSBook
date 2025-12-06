import type { Data, DataItem } from "@/types";
import { Source, t } from "@/utils";

/**
 * `_api` 是一个使用 API 获取数据的示例源。
 *
 * 我们使用 `Source` 类来定义一个新的源，我们需要将这个实例默认导出。
 * 在 `Source` 构造函数中，我们传递了源的基本信息，这些参数会在 OpenAPI 文档中展示。
 */
export default new Source({
	// 源的参数需要在 RSSBook 初始化时传入，我们推荐使用大写字母和下划线来命名这些参数，以示区别。
	config: {
		GITHUB_EXAMPLE_APIKey: {
			default: "Bearer 123-456-7890",
			description: "RSSBook APIKey",
			required: true,
		},
		GITHUB_EXAMPLE_USERID: {
			default: "1234567890",
			description: "User ID",
		},
	},

	description: // 源的描述信息，一句话即可
	`Github is a code hosting platform for version control and collaboration.`,

	domain: "github.com", // 源的根域名

	slug: "github", // [IMPORTANT]: 源的唯一标识符，必须是小写字母和短横线组成

	title: "Github", // 源的标题。
})
	// 接下来，我们使用 `.feed(config, handlerFn)` 方法来定义 Feed 的具体抓取逻辑和元数据。
	.feed(
		{
			description: // 使用 Markdown 的 Feed 描述信息，详细介绍 Feed 的作用和所有路由参数，可以包含表格等复杂内容。
			`The Github User Events.`,

			fulltext: true, // 是否抓取全文内容。

			language: ["en-US"], // 该 Feed 支持的语言

			maintainer: // 维护者信息，会显示在 Feed 的元数据中。
				{
					name: "RSSBook",
				},

			title: "User Events",

			withImage: "None",
		},
		/**
		 * handlerFn 是每个 `feed` 的具体实现，是一个 `app => app` 回调函数。
		 * 它接受一个基于 `ElysiaJS` 的应用实例，返回一个相同的实例，你不需要知道太多细节。
		 *
		 * 在这个回调函数中，我们通常使用 `app => app.get(path, handler, schema?)` 方法来定义路由。
		 */
		(app) =>
			app
				/**
				 * 在这里，你可以使用 `app` 实例来定义路由和处理逻辑。
				 *
				 * 所有的路由都只能是** GET 请求**，所以你要用到 `app.get(path, handler, schema?)` 方法来定义路由。
				 * 你构建的路由路径前缀是 `/feeds/{{category}}/{{slug}}/`，例如 `/feeds/_example/api/`。
				 * 你可以在在开发环境下访问 `/openapi` 来查看并测试这些路由。
				 *
				 * 下面是一个主页的示例路由。
				 */
				.get(
					/**
					 * 这是路由的相对路径。
					 *
					 * 你可以使用 `:param` 定义一个和多个路由参数。
					 */
					"/events/:username",

					/**
					 * 这是路由的处理函数，在这里编写你的抓取逻辑。
					 *
					 * 它接受一个 Context 对象参数，在大多数情况下，你需要使用像 `props: {  }` 的解构赋值来获取你需要的属性。
					 * 返回的数据需要符合 `Data` 类型，你可以使用 `satisfies Data` 来确保类型正确。
					 */
					async ({
						// props
						meta: { domain }, // meta 包含了源和 Feed 的所有元数据，例如 domain、config、title 等等。
						params: { username }, // 获取路由参数 user

						// function
						cache, // cache 是一个缓存，你可以用它来存储和复用数据，避免重复抓取
						date, // date 是一个日期格式化函数
						ofetch, // ofetch 是一个增强版的 fetch 函数
					}) => {
						const rootURL = `https://api.${domain}`;
						const link = `${rootURL}/users/${username}/events`;

						// 1. 通过 API 获取数据，并使用缓存避免重复抓取
						const items = await cache.tryGet(link, async (url) => {
							const events = await ofetch<GitHubEvent[]>(url, { responseType: "json" });
							const allFilteredEvents = filterEvents(events);

							return allFilteredEvents.map((event) => {
								return {
									author: [
										{
											name: event.author,
										},
									],
									category: [
										{
											name: event.category,
										},
									],
									date: date(event.pubDate),
									description: event.description,
									id: event.guid,
									link: event.link,
									title: event.title,
								} satisfies DataItem;
							});
						});

						// 2. 构造 Data 对象并返回
						const data: Data = {
							description: `The Github Events for user ${username}.`,
							item: items,
							link,
							title: `Github Events for ${username}`,
						};

						return data;
					},
					{
						// 在 `.get(path, handler, schema?)` 的第三个参数中，我们使用 `t` 定义路由 schema，大多数情况，你只需要定义 `params` 部分
						params: t.Object({
							// 对象的 key 是路由参数的名称，value 是参数的类型定义
							// 你可以指定格式，添加描述信息和示例，但是描述要简洁，你应该在更长的 Feed 描述中说明参数
							username: t.String({
								description: "Github Username",
								examples: ["Niapya"],
							}),

							// 或是者使用枚举类型来限定参数值
							// category: t.Optional(
							// 	t.UnionEnum(["news", "updates", "releases"], {
							// 		description: "Category of the feed.",
							// 		examples: ["news", "updates"],
							// 	}),
							// ),
						}),
						///
						/// 但是不要定义 body query 等其他部分，定义这些部分违反了设计原则，还可能出现错误
						///
					},
				),
	);

/**
 * A simple GitHub Event Interface
 * 在实际编写中，你可以放在 `types/*.ts` 文件中统一管理类型定义。
 * https://api.github.com/users/{username}/events
 */
export type GithubEventType =
	| "CommitCommentEvent"
	| "CreateEvent"
	| "DeleteEvent"
	| "DiscussionEvent"
	| "ForkEvent"
	| "IssuesEvent"
	| "IssueCommentEvent"
	| "MemberEvent"
	| "PullRequestEvent"
	| "PullRequestReviewCommentEvent"
	| "PullRequestReviewEvent"
	| "PublicEvent"
	| "PushEvent"
	| "ReleaseEvent"
	| "WatchEvent"
	| "GollumEvent";

interface GitHubEvent {
	id: string;
	type: string;
	actor: {
		login: string;
		id: number;
		avatar_url: string;
		url: string;
	};
	repo: {
		id: number;
		name: string;
		url: string;
		discussion: {
			title: string;
		};
	};
	// biome-ignore lint/suspicious/noExplicitAny: A simple GitHub Event interface
	payload: any;

	created_at: string;
}

/**
 * Code From RSSHub
 */
export const eventTypeMapping: Record<string, GithubEventType> = {
	cmcomm: "CommitCommentEvent",
	create: "CreateEvent",
	delete: "DeleteEvent",
	discussion: "DiscussionEvent",
	fork: "ForkEvent",
	issue: "IssuesEvent",
	issuecomm: "IssueCommentEvent",
	member: "MemberEvent",
	pr: "PullRequestEvent",
	prcomm: "PullRequestReviewCommentEvent",
	prrev: "PullRequestReviewEvent",
	public: "PublicEvent",
	push: "PushEvent",
	release: "ReleaseEvent",
	star: "WatchEvent",
	wiki: "GollumEvent",
};

function formatEventItem(event: GitHubEvent) {
	const { id, type, actor, repo, payload, created_at } = event;

	let title = "";
	let description = "";
	let link = "";

	switch (type) {
		case "PushEvent": {
			title = `${actor.login} pushed to ${repo.name}`;
			const branch = payload.ref ? payload.ref.replace("refs/heads/", "") : "unknown";
			const commitCount = payload.size ? `${payload.size} commit(s) ` : "";
			description = `Pushed ${commitCount}to ${branch} in ${repo.name}`;

			if (payload.commits) {
				link = payload.commits
					.at(-1)
					.url.replace(
						/https:\/\/api\.github\.com\/repos\/([^/]+)\/([^/]+)\/commits\/(\d+)/,
						"https://github.com/$1/$2/commit/$3",
					);
				description += `<br><strong>Latest commit:</strong> ${payload.commits.at(-1).message}`;
			} else {
				link = `https://github.com/${repo.name}/commit/${payload.head}`;
			}
			break;
		}
		case "PullRequestEvent":
			title = `${actor.login} ${payload.action} a pull request in ${repo.name}`;
			if (payload.pull_request) {
				link = payload.pull_request.url.replace(
					/https:\/\/api\.github\.com\/repos\/([^/]+)\/([^/]+)\/pulls\/(\d+)/,
					"https://github.com/$1/$2/pull/$3",
				);
				description = `PR: ${link}`;
			} else {
				link = `https://github.com/${repo.name}`;
				description = `PR: Unknown`;
			}
			break;
		case "PullRequestReviewCommentEvent":
			title = `${actor.login} commented on a pull request review in ${repo.name}`;
			description = `Comment: ${payload.comment?.body || "No comment"}`;
			link = payload.comment?.html_url || `https://github.com/${repo.name}`;
			break;
		case "PullRequestReviewEvent":
			title = `${actor.login} reviewed a pull request in ${repo.name}`;
			description =
				`${actor.login} ${payload.review?.state ?? "operated"} the PR` +
				(payload.review?.body ? `: ${payload.review.body}` : "");
			link = payload.review?.html_url || `https://github.com/${repo.name}`;
			break;
		case "IssueCommentEvent":
			title = `${actor.login} commented on an issue in ${repo.name}`;
			description = `Comment: ${payload.comment?.body || "No comment"}`;
			link = payload.comment?.html_url || `https://github.com/${repo.name}`;
			break;
		case "IssuesEvent":
			title = `${actor.login} ${payload.action} an issue in ${repo.name}`;
			description = `Issue: ${payload.issue?.title || "Unknown"}`;
			link = payload.issue?.html_url || `https://github.com/${repo.name}`;
			break;
		case "CommitCommentEvent":
			title = `${actor.login} commented on a commit in ${repo.name}`;
			description = `Comment: ${payload.comment?.body || "No comment"}`;
			link = payload.comment?.html_url || `https://github.com/${repo.name}`;
			break;
		case "WatchEvent":
			title = `${actor.login} starred ${repo.name}`;
			description = `Starred repository ${repo.name}`;
			link = `https://github.com/${repo.name}`;
			break;
		case "ForkEvent":
			title = `${actor.login} forked ${repo.name}`;
			description = `Forked repository ${repo.name}`;
			link = `https://github.com/${repo.name}`;
			break;
		case "CreateEvent":
			title = `${actor.login} created ${payload.ref_type} in ${repo.name}`;
			description = `Created ${payload.ref_type}: ${payload.ref || repo.name}`;
			link = `https://github.com/${repo.name}`;
			break;
		case "DeleteEvent":
			title = `${actor.login} deleted ${payload.ref_type} in ${repo.name}`;
			description = `Deleted ${payload.ref_type}: ${payload.ref}`;
			link = `https://github.com/${repo.name}`;
			break;
		case "ReleaseEvent":
			title = `${actor.login} released ${payload.release?.name || payload.release?.tag_name} in ${repo.name}`;
			description = payload.release?.body || `Released ${payload.release?.tag_name}`;
			link = payload.release?.html_url || `https://github.com/${repo.name}`;
			break;
		case "PublicEvent":
			title = `${actor.login} made ${repo.name} public`;
			description = `Repository ${repo.name} was made public`;
			link = `https://github.com/${repo.name}`;
			break;
		case "MemberEvent":
			title = `${actor.login} ${payload.action} as a member of ${repo.name}`;
			description = `Member ${payload.action} in repository ${repo.name}`;
			link = `https://github.com/${repo.name}`;
			break;
		case "GollumEvent":
			title = `${actor.login} update the wiki in ${repo.name}`;
			description = "<ul>";
			for (const page of payload.pages ?? []) {
				description += `<li>Page <a href=${page.html_url}>${page.page_name}</a> ${page.action} ${page.summary ? `: ${page.summary}` : ""}</li>`;
			}
			description += `</ul>`;
			link = `https://github.com/${repo.name}`;
			break;
		case "DiscussionEvent":
			title = `${actor.login} ${payload.action} a discussion ${repo.discussion?.title ?? ""} on ${repo.name}`;
			description = payload.discussion?.body ?? "Unknown";
			link = payload.discussion?.html_url || `https://github.com/${repo.name}`;
			break;
		default:
			title = `${actor.login} performed ${type} in ${repo?.name || "unknown repository"}`;
			description = `Activity type: ${type} ${JSON.stringify(event)}`;
			link = repo ? `https://github.com/${repo.name}` : `https://github.com/${actor.login}`;
	}

	return {
		author: actor.login,
		category: type,
		description,
		guid: id,
		link,
		pubDate: created_at,
		title,
	};
}

export function filterEvents(data: GitHubEvent[]) {
	// Parse requested event types and map short names to full event types
	const filteredEventTypes: string[] = [];
	return data
		.filter((event) => filteredEventTypes.length === 0 || filteredEventTypes.includes(event.type))
		.map((event) => formatEventItem(event));
}
