import type {
	Cookie,
	CookieParam,
	HTTPResponse,
	Page,
	ResourceType,
	WaitTimeoutOptions,
} from "puppeteer";

const DEFAULT_BLOCKED_RESOURCES = ["image", "media", "font"] satisfies ResourceType[];

/**
 * Block selected resource types on a Puppeteer page.
 *
 * Call this before navigation. RSSBook keeps this helper small because routes
 * may still need to add their own request handlers for APIs or anti-bot flows.
 */
export async function blockResources(
	page: Page,
	resourceTypes: readonly ResourceType[] = DEFAULT_BLOCKED_RESOURCES,
): Promise<void> {
	const blocked = new Set<ResourceType>(resourceTypes);

	await page.setRequestInterception(true);
	page.on("request", (request) => {
		if (blocked.has(request.resourceType())) {
			void request.abort();
			return;
		}

		void request.continue();
	});
}

/**
 * Wait for a matching response, optionally trigger an action, and parse JSON.
 */
export async function waitForResponseJSON<T>(
	page: Page,
	predicate: (response: HTTPResponse) => boolean | Promise<boolean>,
	trigger?: () => Promise<void>,
	options?: WaitTimeoutOptions,
): Promise<T> {
	const responsePromise = page.waitForResponse(predicate, options);
	await trigger?.();

	const data: T = await (await responsePromise).json();
	return data;
}

/**
 * Convert Puppeteer cookies to a `Cookie` request header.
 */
export function cookiesToHeader(cookies: readonly Pick<Cookie, "name" | "value">[]): string {
	return cookies
		.map(({ name, value }) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
		.join("; ");
}

/**
 * Parse a `Cookie` request header into Puppeteer cookie parameters.
 *
 * Pass `url` when the header came from a specific origin so Puppeteer can infer
 * domain, path, and security defaults.
 */
export function cookieHeaderToParams(cookieHeader: string, url?: string): CookieParam[] {
	return cookieHeader
		.split(";")
		.map((part) => part.trim())
		.filter(Boolean)
		.flatMap((part) => {
			const separatorIndex = part.indexOf("=");
			if (separatorIndex <= 0) return [];

			const cookie = {
				name: decodeURIComponent(part.slice(0, separatorIndex).trim()),
				value: decodeURIComponent(part.slice(separatorIndex + 1).trim()),
			};

			return [
				url
					? {
							...cookie,
							url,
						}
					: cookie,
			];
		});
}

/**
 * Read page cookies and format them as a `Cookie` request header.
 */
export async function getCookieHeader(page: Page, ...urls: string[]): Promise<string> {
	return cookiesToHeader(await page.cookies(...urls));
}

/**
 * Apply a `Cookie` request header to the current page.
 */
export async function setCookieHeader(
	page: Page,
	cookieHeader: string,
	options?: { url?: string },
): Promise<void> {
	const cookies = cookieHeaderToParams(cookieHeader, options?.url);
	if (cookies.length) {
		await page.setCookie(...cookies);
	}
}
