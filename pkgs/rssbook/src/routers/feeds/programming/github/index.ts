import type { Data, DataItem } from "@/types";
import { load, Source, t } from "@/utils";
import { parse } from "@/utils/feeds";

type GitHubEvent = {
	actor?: { display_login?: string };
	created_at?: string;
	id: string;
	payload?: { action?: string };
	repo?: { name?: string; url?: string };
	type: string;
};

type GitHubRelease = {
	body?: string;
	html_url: string;
	name?: string;
	published_at?: string;
	tag_name: string;
};

type GitHubSearchRepo = {
	hl_name: string;
	hl_trunc_description?: string;
	public: boolean;
	repo: {
		repository: {
			name: string;
			owner_login: string;
			updated_at: string;
		};
	};
};

type GitHubSearchIssue = {
	author_name: string;
	created: string;
	hl_text?: string;
	hl_title: string;
	labels?: string[];
	number: number;
	repo: {
		repository: {
			name: string;
			owner_login: string;
		};
	};
};

function stripHtmlTags(html: string) {
	const $ = load(`<div>${html}</div>`);
	return $.text().trim();
}

export default new Source({
	config: {
		GITHUB_TOKEN: {
			description: "Optional GitHub access token used to increase API rate limits.",
			required: false,
		},
	},
	description: "Public events, repositories, issues, and release feeds from GitHub.",
	domain: "github.com",
	slug: "github",
	title: "GitHub",
})
	.feed(
		{
			description: "Fetch public activity events for a GitHub user.",
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "User Events",
		},
		(app) =>
			app.get(
				"/events/:username",
				async ({ cache, date, meta: { config }, ofetch, params: { username } }) => {
					if (!config.GITHUB_TOKEN) {
						const feedUrl = `https://github.com/${username}.atom`;
						const data = await cache.tryGet<Data>(feedUrl, async () => {
							const xml = await ofetch(feedUrl, { responseType: "text" });
							return parse(xml) satisfies Data;
						});

						return {
							...data,
							description: `Public GitHub events for ${username}.`,
							language: "en",
							link: `https://github.com/${username}`,
							title: `GitHub Events - ${username}`,
						} satisfies Data;
					}

					const apiUrl = `https://api.github.com/users/${username}/events`;
					const headers = githubHeaders(config.GITHUB_TOKEN);
					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const events = await ofetch<GitHubEvent[]>(apiUrl, { headers, responseType: "json" });
						return events.map(
							(event) =>
								({
									author: [{ name: event.actor?.display_login }],
									date: date(event.created_at ?? new Date().toISOString()),
									id: event.id,
									link: event.repo?.name
										? `https://github.com/${event.repo.name}`
										: "https://github.com",
									title: `${event.type}${event.payload?.action ? ` ${event.payload.action}` : ""} - ${event.repo?.name ?? username}`,
								}) satisfies DataItem,
						);
					});

					return {
						description: `Public GitHub events for ${username}.`,
						item,
						language: "en",
						link: `https://github.com/${username}`,
						title: `GitHub Events - ${username}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						username: t.String({ description: "GitHub username." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch releases from a GitHub repository.",
			fulltext: true,
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Repository Releases",
		},
		(app) =>
			app.get(
				"/repo/:owner/:repo/releases",
				async ({ cache, date, meta: { config }, ofetch, params: { owner, repo } }) => {
					if (!config.GITHUB_TOKEN) {
						const feedUrl = `https://github.com/${owner}/${repo}/releases.atom`;
						const data = await cache.tryGet<Data>(feedUrl, async () => {
							const xml = await ofetch(feedUrl, { responseType: "text" });
							return parse(xml) satisfies Data;
						});

						return {
							...data,
							description: `GitHub releases for ${owner}/${repo}.`,
							language: "en",
							link: `https://github.com/${owner}/${repo}/releases`,
							title: `GitHub Releases - ${owner}/${repo}`,
						} satisfies Data;
					}

					const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases`;
					const headers = githubHeaders(config.GITHUB_TOKEN);
					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const releases = await ofetch<GitHubRelease[]>(apiUrl, {
							headers,
							responseType: "json",
						});
						return releases.map(
							(release) =>
								({
									date: date(release.published_at ?? new Date().toISOString()),
									description: release.body,
									link: release.html_url,
									title: release.name || release.tag_name,
								}) satisfies DataItem,
						);
					});

					return {
						description: `GitHub releases for ${owner}/${repo}.`,
						item,
						language: "en",
						link: `https://github.com/${owner}/${repo}/releases`,
						title: `GitHub Releases - ${owner}/${repo}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						owner: t.String({ description: "Repository owner." }),
						repo: t.String({ description: "Repository name." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch repositories owned by a GitHub user.",
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "User Repositories",
		},
		(app) =>
			app.get(
				"/repos/:user/:type?/:sort?",
				async ({ cache, date, meta: { config }, ofetch, params: { user, type, sort } }) => {
					const repoType = type || "all";
					const repoSort = sort || "created";

					if (config.GITHUB_TOKEN) {
						const apiUrl = `https://api.github.com/users/${user}/repos`;
						const headers = githubHeaders(config.GITHUB_TOKEN);
						const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
							const repos = await ofetch<
								Array<{
									created_at: string;
									description: string | null;
									fork: boolean;
									html_url: string;
									name: string;
									owner: { login: string };
									private: boolean;
									pushed_at?: string;
									updated_at?: string;
								}>
							>(apiUrl, {
								headers,
								query: {
									per_page: "100",
									sort: repoSort,
									type: repoType,
								},
								responseType: "json",
							});

							return repos
								.filter((item) => filterRepoByType(item, repoType, user))
								.map((item) => {
									const updated = item.pushed_at || item.updated_at || item.created_at;
									return {
										author: [{ name: item.owner.login }],
										date: date(updated || new Date().toISOString()),
										description: item.description || undefined,
										link: item.html_url,
										title: item.name,
									} satisfies DataItem;
								});
						});

						return {
							description: `GitHub repositories for ${user}.`,
							item,
							language: "en",
							link: `https://github.com/${user}`,
							title: `GitHub Repositories - ${user}`,
						} satisfies Data;
					}

					const pageUrl = `https://github.com/${user}?tab=repositories`;
					const item = await cache.tryGet<DataItem[]>(pageUrl, async () => {
						const html = await ofetch(pageUrl, { responseType: "text" });
						const $ = load(html);

						return $("li[itemtype='http://schema.org/Code']")
							.toArray()
							.map((el) => {
								const $el = $(el);
								const $repo = $el.find('a[itemprop="name codeRepository"]').first();
								const href = $repo.attr("href") || "";
								const name = $repo.text().trim();
								const description = $el.find('p[itemprop="description"]').first().text().trim();
								const updated = $el.find("relative-time").first().attr("datetime");
								const ownerMatch = href.match(/^\/([^/]+)\/([^/]+)/);
								const owner = ownerMatch?.[1] ?? user;
								const isPublic = $el.hasClass("public");
								const isPrivate = $el.hasClass("private");
								const isFork = $el.hasClass("fork");
								const isSource = $el.hasClass("source");

								return {
									flags: { isFork, isPrivate, isPublic, isSource, owner },
									item: {
										author: [{ name: owner }],
										date: updated ? date(updated) : new Date(),
										description: description || undefined,
										link: href ? `https://github.com${href}` : pageUrl,
										title: name || href,
									} satisfies DataItem,
								};
							})
							.filter((entry) => filterHtmlRepoByType(entry.flags, repoType, user))
							.map((entry) => entry.item);
					});

					return {
						description: `GitHub repositories for ${user}.`,
						item,
						language: "en",
						link: `https://github.com/${user}`,
						title: `GitHub Repositories - ${user}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						sort: t.Optional(
							t.String({
								description: "Sort by created, updated, pushed, full_name, stars, or forks.",
							}),
						),
						type: t.Optional(
							t.String({
								description:
									"Repository type: all, owner, member, public, private, forks, or sources.",
							}),
						),
						user: t.String({ description: "GitHub username." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch issues from a GitHub repository.",
			fulltext: true,
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Repository Issues",
		},
		(app) =>
			app.get(
				"/repo/:owner/:repo/issues/:state?/:labels?",
				async ({
					cache,
					date,
					meta: { config },
					ofetch,
					params: { labels, owner, repo, state },
				}) => {
					const issueState = state || "open";
					const labelList = labels ? labels.split(",") : [];

					if (config.GITHUB_TOKEN) {
						const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues`;
						const headers = {
							Accept: "application/vnd.github.v3+json",
							...githubHeaders(config.GITHUB_TOKEN),
						};
						const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
							const issues = await ofetch<
								Array<{
									body?: string;
									created_at: string;
									html_url: string;
									number: number;
									title: string;
									user: { login: string };
								}>
							>(apiUrl, {
								headers,
								query: {
									direction: "desc",
									labels: labels,
									per_page: "100",
									sort: "created",
									state: issueState,
								},
								responseType: "json",
							});

							return issues
								.filter((issue) => !issue.html_url.includes("/pull/"))
								.map((issue) => ({
									author: [{ name: issue.user.login }],
									date: date(issue.created_at),
									description: issue.body,
									link: issue.html_url,
									title: issue.title,
								})) satisfies DataItem[];
						});

						return {
							description: `GitHub issues for ${owner}/${repo}.`,
							item,
							language: "en",
							link: `https://github.com/${owner}/${repo}/issues`,
							title: `GitHub Issues - ${owner}/${repo}`,
						} satisfies Data;
					}

					const queryParts = [
						`repo:${owner}/${repo}`,
						"is:issue",
						`is:${issueState}`,
						...labelList.map((label) => `label:${label}`),
					];
					const searchUrl = `https://github.com/search?type=issues&q=${encodeURIComponent(queryParts.join(" "))}&s=created&o=desc`;
					const item = await cache.tryGet<DataItem[]>(searchUrl, async () => {
						const response = await ofetch<{ payload: { results: GitHubSearchIssue[] } }>(
							searchUrl,
							{
								headers: { accept: "application/json" },
								responseType: "json",
							},
						);

						return response.payload.results.map((issue) => {
							const repository = issue.repo.repository;
							return {
								author: [{ name: issue.author_name }],
								category: issue.labels?.map((label) => ({ name: label })),
								date: date(issue.created),
								description: issue.hl_text,
								link: `https://github.com/${repository.owner_login}/${repository.name}/issues/${issue.number}`,
								title: stripHtmlTags(issue.hl_title),
							} satisfies DataItem;
						});
					});

					return {
						description: `GitHub issues for ${owner}/${repo}.`,
						item,
						language: "en",
						link: `https://github.com/${owner}/${repo}/issues`,
						title: `GitHub Issues - ${owner}/${repo}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						labels: t.Optional(t.String({ description: "Comma-separated list of label names." })),
						owner: t.String({ description: "Repository owner." }),
						repo: t.String({ description: "Repository name." }),
						state: t.Optional(
							t.String({
								default: "open",
								description: "Issue state: open, closed, or all.",
							}),
						),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch pull requests from a GitHub repository.",
			fulltext: true,
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Repository Pull Requests",
		},
		(app) =>
			app.get(
				"/repo/:owner/:repo/pulls/:state?/:labels?",
				async ({
					cache,
					date,
					meta: { config },
					ofetch,
					params: { labels, owner, repo, state },
				}) => {
					const prState = state || "open";
					const labelList = labels ? labels.split(",") : [];

					if (config.GITHUB_TOKEN) {
						const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues`;
						const headers = {
							Accept: "application/vnd.github.v3+json",
							...githubHeaders(config.GITHUB_TOKEN),
						};
						const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
							const pulls = await ofetch<
								Array<{
									body?: string;
									created_at: string;
									html_url: string;
									number: number;
									pull_request?: unknown;
									title: string;
									user: { login: string };
								}>
							>(apiUrl, {
								headers,
								query: {
									direction: "desc",
									labels: labels,
									per_page: "100",
									sort: "created",
									state: prState,
								},
								responseType: "json",
							});

							return pulls
								.filter((issue) => issue.pull_request)
								.map((pull) => ({
									author: [{ name: pull.user.login }],
									date: date(pull.created_at),
									description: pull.body,
									link: pull.html_url,
									title: pull.title,
								})) satisfies DataItem[];
						});

						return {
							description: `GitHub pull requests for ${owner}/${repo}.`,
							item,
							language: "en",
							link: `https://github.com/${owner}/${repo}/pulls`,
							title: `GitHub Pull Requests - ${owner}/${repo}`,
						} satisfies Data;
					}

					const queryParts = [
						`repo:${owner}/${repo}`,
						"is:pr",
						`is:${prState}`,
						...labelList.map((label) => `label:${label}`),
					];
					const searchUrl = `https://github.com/search?type=pullrequests&q=${encodeURIComponent(queryParts.join(" "))}&s=created&o=desc`;
					const item = await cache.tryGet<DataItem[]>(searchUrl, async () => {
						const response = await ofetch<{ payload: { results: GitHubSearchIssue[] } }>(
							searchUrl,
							{
								headers: { accept: "application/json" },
								responseType: "json",
							},
						);

						return response.payload.results.map((pull) => {
							const repository = pull.repo.repository;
							return {
								author: [{ name: pull.author_name }],
								category: pull.labels?.map((label) => ({ name: label })),
								date: date(pull.created),
								description: pull.hl_text,
								link: `https://github.com/${repository.owner_login}/${repository.name}/pull/${pull.number}`,
								title: stripHtmlTags(pull.hl_title),
							} satisfies DataItem;
						});
					});

					return {
						description: `GitHub pull requests for ${owner}/${repo}.`,
						item,
						language: "en",
						link: `https://github.com/${owner}/${repo}/pulls`,
						title: `GitHub Pull Requests - ${owner}/${repo}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						labels: t.Optional(t.String({ description: "Comma-separated list of label names." })),
						owner: t.String({ description: "Repository owner." }),
						repo: t.String({ description: "Repository name." }),
						state: t.Optional(
							t.String({
								default: "open",
								description: "Pull request state: open, closed, or all.",
							}),
						),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch commits from a GitHub repository.",
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Repository Commits",
		},
		(app) =>
			app.get(
				"/repo/:owner/:repo/commits",
				async ({ cache, date, meta: { config }, ofetch, params: { owner, repo } }) => {
					if (!config.GITHUB_TOKEN) {
						const feedUrl = `https://github.com/${owner}/${repo}/commits.atom`;
						const data = await cache.tryGet<Data>(feedUrl, async () => {
							const xml = await ofetch(feedUrl, { responseType: "text" });
							return parse(xml) satisfies Data;
						});

						return {
							...data,
							description: `GitHub commits for ${owner}/${repo}.`,
							language: "en",
							link: `https://github.com/${owner}/${repo}/commits`,
							title: `GitHub Commits - ${owner}/${repo}`,
						} satisfies Data;
					}

					const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits`;
					const headers = githubHeaders(config.GITHUB_TOKEN);
					const item = await cache.tryGet<DataItem[]>(apiUrl, async () => {
						const commits = await ofetch<
							Array<{
								commit: { author: { date: string; name: string }; message: string };
								html_url: string;
								sha: string;
							}>
						>(apiUrl, {
							headers,
							query: { per_page: "100" },
							responseType: "json",
						});

						return commits.map((commit) => ({
							author: [{ name: commit.commit.author.name }],
							date: date(commit.commit.author.date),
							description: commit.commit.message,
							link: commit.html_url,
							title: commit.commit.message.split("\n")[0],
						})) satisfies DataItem[];
					});

					return {
						description: `GitHub commits for ${owner}/${repo}.`,
						item,
						language: "en",
						link: `https://github.com/${owner}/${repo}/commits`,
						title: `GitHub Commits - ${owner}/${repo}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						owner: t.String({ description: "Repository owner." }),
						repo: t.String({ description: "Repository name." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch tags from a GitHub repository.",
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Repository Tags",
		},
		(app) =>
			app.get(
				"/repo/:owner/:repo/tags",
				async ({ cache, ofetch, params: { owner, repo } }) => {
					const feedUrl = `https://github.com/${owner}/${repo}/tags.atom`;
					const data = await cache.tryGet<Data>(feedUrl, async () => {
						const xml = await ofetch(feedUrl, { responseType: "text" });
						return parse(xml) satisfies Data;
					});

					return {
						...data,
						description: `GitHub tags for ${owner}/${repo}.`,
						language: "en",
						link: `https://github.com/${owner}/${repo}/tags`,
						title: `GitHub Tags - ${owner}/${repo}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						owner: t.String({ description: "Repository owner." }),
						repo: t.String({ description: "Repository name." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch wiki history from a GitHub repository.",
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Repository Wiki",
		},
		(app) =>
			app.get(
				"/repo/:owner/:repo/wiki/:page?",
				async ({ cache, ofetch, params: { owner, repo }, toAbsoluteURL }) => {
					const feedUrl = `https://github.com/${owner}/${repo}/wiki.atom`;
					const data = await cache.tryGet<Data>(feedUrl, async () => {
						const xml = await ofetch(feedUrl, { responseType: "text" });
						return parse(xml) satisfies Data;
					});

					return {
						...data,
						description: `GitHub wiki for ${owner}/${repo}.`,
						item: data.item?.map((item) => ({
							...item,
							link: toAbsoluteURL(item.link, `https://github.com/${owner}/${repo}`),
						})),
						language: "en",
						link: `https://github.com/${owner}/${repo}/wiki`,
						title: `GitHub Wiki - ${owner}/${repo}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						owner: t.String({ description: "Repository owner." }),
						page: t.Optional(
							t.String({ description: "Wiki page slug (ignored; all pages are returned)." }),
						),
						repo: t.String({ description: "Repository name." }),
					}),
				},
			),
	)
	.feed(
		{
			description: "Search repositories on GitHub.",
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Search Results",
		},
		(app) =>
			app.get(
				"/search/:query/:sort?/:order?",
				async ({ cache, date, ofetch, params: { order, query, sort } }) => {
					const searchSort = sort === "bestmatch" || !sort ? "" : sort;
					const searchOrder = order || "desc";
					const searchUrl = `https://github.com/search?type=repositories&q=${encodeURIComponent(query)}&s=${searchSort}&o=${searchOrder}`;
					const item = await cache.tryGet<DataItem[]>(searchUrl, async () => {
						const response = await ofetch<{ payload: { results: GitHubSearchRepo[] } }>(searchUrl, {
							headers: { accept: "application/json" },
							responseType: "json",
						});

						return response.payload.results.map((repo) => {
							const repository = repo.repo.repository;
							return {
								author: [{ name: repository.owner_login }],
								date: date(repository.updated_at),
								description: repo.hl_trunc_description,
								link: `https://github.com/${repository.owner_login}/${repository.name}`,
								title: stripHtmlTags(repo.hl_name),
							} satisfies DataItem;
						});
					});

					return {
						description: `GitHub search results for "${query}".`,
						item,
						language: "en",
						link: `https://github.com/search?q=${encodeURIComponent(query)}&type=repositories`,
						title: `GitHub Search - ${query}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						order: t.Optional(
							t.String({
								default: "desc",
								description: "Sort order: asc or desc.",
							}),
						),
						query: t.String({ description: "Search query." }),
						sort: t.Optional(
							t.String({
								default: "bestmatch",
								description: "Sort by bestmatch, stars, forks, or updated.",
							}),
						),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch trending repositories from GitHub.",
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Trending Repositories",
		},
		(app) =>
			app.get(
				"/trending/:since/:language?/:spoken?",
				async ({ cache, formatHTML, ofetch, params: { language, since, spoken } }) => {
					const trendingLanguage = language && language !== "any" ? language : "";
					const spokenLanguage = spoken || "";
					const url = `https://github.com/trending/${encodeURIComponent(trendingLanguage)}?since=${since}&spoken_language_code=${spokenLanguage}`;

					const item = await cache.tryGet<DataItem[]>(url, async () => {
						const html = await ofetch(url, { responseType: "text" });
						const $ = load(html);

						return $("article.Box-row")
							.toArray()
							.map((el) => {
								const $el = $(el);
								const $link = $el.find("h2 a").last();
								const href = $link.attr("href");
								const title = $link.text().trim().replace(/\s+/g, " ");
								const description = $el.find("p.color-fg-muted").first().html();

								return {
									date: new Date(),
									description: description ? formatHTML(description, url) : undefined,
									link: href ? `https://github.com${href}` : "https://github.com/trending",
									title,
								} satisfies DataItem;
							});
					});

					return {
						description: `GitHub trending repositories (${since}).`,
						item,
						language: "en",
						link: url,
						title: `GitHub Trending - ${since}${trendingLanguage ? ` / ${trendingLanguage}` : ""}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						language: t.Optional(
							t.String({
								default: "any",
								description: "Programming language filter. Use 'any' for all languages.",
							}),
						),
						since: t.String({
							description: "Time range: daily, weekly, or monthly.",
						}),
						spoken: t.Optional(
							t.String({
								description: "Spoken language code.",
							}),
						),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch repositories for a GitHub topic.",
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "Topic Repositories",
		},
		(app) =>
			app.get(
				"/topics/:name/:qs?",
				async ({ cache, date, formatHTML, load, ofetch, params: { name, qs } }) => {
					const url = new URL(`https://github.com/topics/${name}`);
					if (qs) {
						const params = new URLSearchParams(qs);
						for (const [key, value] of params) {
							url.searchParams.set(key, value);
						}
					}

					const item = await cache.tryGet<DataItem[]>(url.href, async () => {
						const html = await ofetch(url.href, { responseType: "text" });
						const $ = load(html);

						return $("article.border")
							.toArray()
							.map((el) => {
								const $el = $(el);
								const $repoLink = $el.find("h3 a").last();
								const href = $repoLink.attr("href");
								const title = $repoLink.text().trim().replace(/\s+/g, " ");
								const $owner = $el.find("h3 a").first();
								const description = $el.find("p.color-fg-muted").first().html();
								const updated = $el.find("relative-time").attr("datetime");
								const categories = $el
									.find(".topic-tag")
									.toArray()
									.map((tag) => ({ name: $(tag).text().trim() }));

								return {
									author: [{ name: $owner.text().trim() }],
									category: categories.length ? categories : undefined,
									date: updated ? date(updated) : new Date(),
									description: description ? formatHTML(description, url.href) : undefined,
									link: href ? `https://github.com${href}` : `https://github.com/topics/${name}`,
									title,
								} satisfies DataItem;
							});
					});

					return {
						description: `GitHub topic repositories for ${name}.`,
						item,
						language: "en",
						link: url.href,
						title: `GitHub Topic - ${name}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						name: t.String({ description: "Topic name." }),
						qs: t.Optional(
							t.String({
								description: "Query string like l=php&o=desc&s=stars.",
							}),
						),
					}),
				},
			),
	)
	.feed(
		{
			description: "Fetch public activity for a GitHub user from the official Atom feed.",
			language: "en",
			maintainer: { name: "RSSBook" },
			title: "User Activity",
		},
		(app) =>
			app.get(
				"/activity/:user",
				async ({ cache, ofetch, params: { user } }) => {
					const feedUrl = `https://github.com/${user}.atom`;
					const data = await cache.tryGet<Data>(feedUrl, async () => {
						const xml = await ofetch(feedUrl, { responseType: "text" });
						return parse(xml) satisfies Data;
					});

					return {
						...data,
						description: `GitHub activity for ${user}.`,
						language: "en",
						link: `https://github.com/${user}`,
						title: `GitHub Activity - ${user}`,
					} satisfies Data;
				},
				{
					params: t.Object({
						user: t.String({ description: "GitHub username." }),
					}),
				},
			),
	);

function githubHeaders(token?: string) {
	return token ? { Authorization: `Bearer ${token}` } : undefined;
}

function filterRepoByType(
	item: { fork: boolean; owner: { login: string }; private: boolean },
	type: string,
	user: string,
) {
	switch (type) {
		case "all":
			return true;
		case "owner":
			return item.owner.login === user;
		case "member":
			return item.owner.login !== user;
		case "public":
			return !item.private;
		case "private":
			return item.private;
		case "forks":
			return item.fork;
		case "sources":
			return !item.fork;
		default:
			return true;
	}
}

function filterHtmlRepoByType(
	flags: {
		isFork: boolean;
		isPrivate: boolean;
		isPublic: boolean;
		isSource: boolean;
		owner: string;
	},
	type: string,
	user: string,
) {
	switch (type) {
		case "all":
			return true;
		case "owner":
			return flags.owner === user && !flags.isFork;
		case "member":
			return flags.owner !== user;
		case "public":
			return flags.isPublic;
		case "private":
			return flags.isPrivate;
		case "forks":
			return flags.isFork;
		case "sources":
			return flags.isSource;
		default:
			return true;
	}
}
