/**
 * Convert relative URL to absolute URL
 */

export function toAbsoluteURL(url: string | URL, baseUrl: string): string {
	if (!baseUrl || !url) return typeof url === "string" ? url : url.href;

	const urlString = typeof url === "string" ? url : url.href;

	// Already absolute URL
	if (/^https?:\/\//i.test(urlString) || /^\/\//i.test(urlString)) {
		return urlString;
	}

	try {
		return new URL(urlString, baseUrl).href;
	} catch {
		return urlString;
	}
}
