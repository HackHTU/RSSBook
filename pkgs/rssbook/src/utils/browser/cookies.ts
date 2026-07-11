import type { BrowserContext, Cookie, CookieData, Page } from "puppeteer-core";

export type CookieTarget = BrowserContext | Page;

/** Convert Puppeteer cookies to a Cookie request header without rewriting values. */
export function cookiesToHeader(cookies: readonly Pick<Cookie, "name" | "value">[]): string {
	return cookies.map(({ name, value }) => (name ? `${name}=${value}` : value)).join("; ");
}

/** Parse a Cookie request header into Puppeteer browser-context cookie data. */
export function cookieHeaderToCookies(cookieHeader: string, target: string | URL): CookieData[] {
	const url = typeof target === "string" ? new URL(target) : target;

	return cookieHeader
		.split(";")
		.map((part) => part.trim())
		.filter(Boolean)
		.map((part) => {
			const separatorIndex = part.indexOf("=");
			const name = separatorIndex < 0 ? "" : part.slice(0, separatorIndex).trim();
			const value = separatorIndex < 0 ? part : part.slice(separatorIndex + 1).trim();

			return {
				domain: url.hostname,
				name,
				path: "/",
				secure: url.protocol === "https:",
				value,
			};
		});
}

/** Read cookies and format them as a Cookie request header. */
export async function getCookieHeader(target: CookieTarget): Promise<string> {
	return cookiesToHeader(await getBrowserContext(target).cookies());
}

/** Parse and apply a Cookie request header to a page or browser context. */
export async function setCookieHeader(
	target: CookieTarget,
	cookieHeader: string,
	url: string | URL,
): Promise<void> {
	const cookies = cookieHeaderToCookies(cookieHeader, url);
	if (cookies.length > 0) await getBrowserContext(target).setCookie(...cookies);
}

function getBrowserContext(target: CookieTarget): BrowserContext {
	return "browserContext" in target ? target.browserContext() : target;
}
