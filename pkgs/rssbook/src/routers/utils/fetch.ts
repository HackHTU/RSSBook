import type { CheerioAPI } from "cheerio";
import { Elysia, t } from "elysia";
import { injectPlugin, renderQuery } from "@/plugins";
import type { Data, DataItem } from "@/types";
import {
	FetchHtmlError,
	InvalidDomainNameError,
	InvalidDomainSuffixError,
	InvalidProtocolError,
	InvalidUrlError,
	LocalAddressError,
	LocalIpAddressError,
	PrivateNetworkError,
} from "@/utils/error";

export default new Elysia({
	detail: {
		description: `
Fetch and parse HTML pages into Feed.

You can specify CSS selectors to extract feed metadata and items from HTML pages.

> [!IMPORTANT]
> This is only suitable for some small, basic sites. **If your site already has its \`Feed\`, use that.**

If you want to build a more reliable feed, create your own routing and contribute to the project—it's not difficult!

Check out the [📕 RSSBook](https://github.com/HackHTU/RSSBook) for more details.
	`,
	},
	name: "RSSBook/Router/Utils/Fetch",
	prefix: "/fetch",
})
	.use(injectPlugin)
	.get(
		"/html",
		async ({
			query: {
				url,
				title: titleSelector,
				description: descriptionSelector,
				author: authorSelector,
				update: updateSelector,
				item: itemSelector,
				"item-title": itemTitleSelector,
				"item-description": itemDescriptionSelector,
				"item-link": itemLinkSelector,
				"item-date": itemDateSelector,
				"item-content": itemContentSelector,
			},
			ofetch,
			load,
			toAbsoluteURL,
			uuid,
			formatHTML,
			date,
		}) => {
			// Validate URL: only allow http/https with domain names, disallow IP and local addresses
			const validateUrl = (urlString: string): void => {
				let parsedUrl: URL;
				try {
					parsedUrl = new URL(urlString);
				} catch {
					throw new InvalidUrlError();
				}

				// Only allow http and https protocols
				if (!["http:", "https:"].includes(parsedUrl.protocol)) {
					throw new InvalidProtocolError();
				}

				// Skip further validation in test environment
				if (process.env.NODE_ENV !== "production") {
					return;
				}

				const hostname = parsedUrl.hostname.toLowerCase();

				// Disallow localhost and local hostnames
				const localHostnames = ["localhost", "127.0.0.1", "::1", "0.0.0.0"];
				if (localHostnames.includes(hostname)) {
					throw new LocalAddressError();
				}

				// Disallow .local and .localhost TLDs
				if (hostname.endsWith(".local") || hostname.endsWith(".localhost")) {
					throw new InvalidDomainSuffixError();
				}

				// Disallow IP addresses (IPv4 and IPv6)
				// IPv4 pattern: digits and dots only, 4 octets
				const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
				// IPv6 pattern: hex digits and colons, with optional brackets
				const ipv6Pattern = /^(\[)?[0-9a-f:]+(\])?$/i;

				if (ipv4Pattern.test(hostname)) {
					throw new LocalIpAddressError();
				}

				if (ipv6Pattern.test(hostname) || hostname.includes(":")) {
					throw new LocalIpAddressError();
				}

				// Disallow private network ranges (additional check for edge cases)
				// 10.x.x.x, 172.16-31.x.x, 192.168.x.x
				const privateIpPatterns = [
					/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
					/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/,
					/^192\.168\.\d{1,3}\.\d{1,3}$/,
					/^169\.254\.\d{1,3}\.\d{1,3}$/, // Link-local
					/^100\.(6[4-9]|[7-9]\d|1[0-2]\d)\.\d{1,3}\.\d{1,3}$/, // Carrier-grade NAT
				];

				for (const pattern of privateIpPatterns) {
					if (pattern.test(hostname)) {
						throw new PrivateNetworkError();
					}
				}

				// Ensure hostname has at least one dot (is a proper domain)
				if (!hostname.includes(".")) {
					throw new InvalidDomainNameError();
				}
			};

			validateUrl(url);

			try {
				const response = await ofetch(url, { responseType: "text" });
				const $ = load(response);

				// Helper function to select element from CheerioAPI or Selection
				const selectElement = ($elem: CheerioAPI | ReturnType<CheerioAPI>, selector: string) => {
					return typeof $elem === "function" ? $elem(selector) : $elem.find(selector);
				};

				// Helper function to extract text by trying multiple selectors
				// For meta tags, extracts from 'content' attribute; for others, from element text
				const extractTextBySelector = (
					$elem: CheerioAPI | ReturnType<CheerioAPI>,
					...selectors: (string | undefined)[]
				) => {
					for (const selector of selectors) {
						if (!selector) continue;
						const element = selectElement($elem, selector);
						if (element.length > 0) {
							const firstElement = element.first();

							// For meta tags, get content attribute instead of text
							if (firstElement.is("meta")) {
								const content = firstElement.attr("content")?.trim();
								if (content) return content;
							} else {
								const text = firstElement.text().trim();
								if (text) return text;
							}
						}
					}
					return undefined;
				};

				// Helper function to extract attribute value
				const extractAttrBySelector = (
					$elem: CheerioAPI | ReturnType<CheerioAPI>,
					selector: string | undefined,
					...attrs: string[]
				): string | undefined => {
					if (!selector) return undefined;
					const element = selectElement($elem, selector);
					if (element.length > 0) {
						for (const attr of attrs) {
							const value = element.first().attr(attr);
							if (value) return value.trim();
						}
					}
					return undefined;
				};

				// Extract feed-level metadata
				const title =
					(titleSelector
						? extractTextBySelector($, titleSelector)
						: extractTextBySelector(
								$,
								"head > title",
								"meta[property='og:title']",
								"meta[name='twitter:title']",
								"h1",
							)) ?? "No title";

				const description =
					(descriptionSelector
						? extractTextBySelector($, descriptionSelector)
						: extractTextBySelector(
								$,
								"meta[name='description']",
								"meta[property='og:description']",
								"meta[name='twitter:description']",
							)) ?? "";

				const authorName = authorSelector
					? extractTextBySelector($, authorSelector)
					: extractTextBySelector($, "meta[name='author']", ".author");

				const updateDateText = updateSelector
					? extractTextBySelector($, updateSelector)
					: undefined;
				const updateDate = updateDateText ? date(updateDateText) : undefined;

				// Extract favicon
				const faviconHref =
					extractAttrBySelector($, "link[rel='icon']", "href") ??
					extractAttrBySelector($, "link[rel='shortcut icon']", "href") ??
					"/favicon.ico";
				const favicon = toAbsoluteURL(faviconHref, url);

				// Extract items if item selector is provided
				const items: DataItem[] = [];
				if (itemSelector) {
					$(itemSelector).each((_, element) => {
						const $item = $(element);

						// Extract item title
						const itemTitle =
							(itemTitleSelector
								? extractTextBySelector($item, itemTitleSelector)
								: extractTextBySelector($item, "h1", "h2", "h3", ".title", "[class*='title']")) ||
							"";

						// Extract item link
						let itemLink =
							(itemLinkSelector
								? extractAttrBySelector($item, itemLinkSelector, "href")
								: (extractAttrBySelector($item, "a", "href") ??
									extractAttrBySelector($item, "[href]", "href"))) ?? "";
						itemLink = toAbsoluteURL(itemLink, url);

						// Extract item description
						const itemDescription =
							(itemDescriptionSelector
								? extractTextBySelector($item, itemDescriptionSelector)
								: extractTextBySelector($item, ".description", ".summary", ".excerpt", "p")) || "";

						// Extract item content HTML
						const itemContentHTML = itemContentSelector
							? $item.find(itemContentSelector).first().html()?.trim()
							: $item.find("article").first().html()?.trim();
						const itemContent = itemContentHTML ? formatHTML(itemContentHTML, url) : undefined;

						// Extract item date with fallback to current date
						const itemDate = (() => {
							const defaultSelectors = ["time", ".date", ".published", "[datetime]"];
							const selectors = itemDateSelector ? [itemDateSelector] : defaultSelectors;

							for (const selector of selectors) {
								const itemDateText =
									extractAttrBySelector($item, selector, "datetime", "date") ??
									extractTextBySelector($item, selector);
								if (itemDateText) {
									const parsedDate = date(itemDateText);
									if (!Number.isNaN(parsedDate.getTime())) {
										return parsedDate;
									}
								}
							}
							return new Date();
						})();

						// Only add item if it has at least a title or link
						if (itemTitle || itemLink) {
							items.push({
								content: itemContent,
								date: itemDate,
								description: itemDescription || undefined,
								id: uuid(itemLink, itemTitle),
								link: itemLink || url,
								title: itemTitle || "No title",
							});
						}
					});
				}

				const data: Data = {
					author: authorName ? { name: authorName } : undefined,
					description: description || undefined,
					favicon,
					item: items.length > 0 ? items : undefined,
					link: url,
					title,
					updated: updateDate ? date(updateDate) : undefined,
				};

				return data;
			} catch (error) {
				throw new FetchHtmlError(url, error);
			}
		},
		{
			query: t.Object({
				author: t.Optional(
					t.String({
						description: "CSS selector for extracting author name",
						examples: [".author"],
					}),
				),
				description: t.Optional(
					t.String({
						description: "CSS selector for extracting feed description",
						examples: ["meta[name='description']"],
					}),
				),
				item: t.Optional(
					t.String({
						description: "CSS selector for extracting list items (parent container)",
						examples: ["ol#b_results li"],
					}),
				),
				"item-content": t.Optional(
					t.String({
						description: "CSS selector for extracting item content (relative to item)",
						examples: ["b_caption"],
					}),
				),
				"item-date": t.Optional(
					t.String({
						description: "CSS selector for extracting item date (relative to item)",
						examples: [".published"],
					}),
				),
				"item-description": t.Optional(
					t.String({
						description: "CSS selector for extracting item description (relative to item)",
						examples: ["b_caption"],
					}),
				),
				"item-link": t.Optional(
					t.String({
						description: "CSS selector for extracting item link (relative to item)",
						examples: ["h2 a[href]"],
					}),
				),
				"item-title": t.Optional(
					t.String({
						description: "CSS selector for extracting item title (relative to item)",
						examples: ["h2"],
					}),
				),
				title: t.Optional(
					t.String({
						description: "CSS selector for extracting feed title",
						examples: ["head > title"],
					}),
				),
				update: t.Optional(
					t.String({
						description: "CSS selector for extracting last update date",
						examples: ["meta[name='date']"],
					}),
				),
				url: t.String({
					description: "Target URL to fetch and parse",
					examples: ["https://www.bing.com/search?q=rssbook"],
					format: "uri",
				}),

				...renderQuery,
			}),
		},
	);
