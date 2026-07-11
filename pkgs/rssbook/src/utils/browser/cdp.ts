import { BrowserEndpointError, UnsupportedProtocolError } from "@/utils/error";

/** Resolve an HTTP Chrome debugging endpoint or normalize a WebSocket endpoint. */
export async function resolveBrowserWSEndpoint(endpoint: string | URL): Promise<string> {
	const url = new URL(endpoint);

	if (url.protocol === "ws:" || url.protocol === "wss:") {
		return url.toString();
	}

	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new UnsupportedProtocolError(url.protocol);
	}

	const pathname = url.pathname.replace(/\/$/, "");
	url.pathname = pathname.endsWith("/json/version") ? pathname : `${pathname}/json/version`;

	const response = await fetch(url);
	if (!response.ok) {
		throw new BrowserEndpointError(
			`Failed to resolve Puppeteer browser endpoint from ${url}: ${response.status} ${response.statusText}`,
		);
	}

	const data: unknown = await response.json();
	if (
		typeof data !== "object" ||
		data === null ||
		!("webSocketDebuggerUrl" in data) ||
		typeof data.webSocketDebuggerUrl !== "string"
	) {
		throw new BrowserEndpointError(`Invalid Puppeteer browser version response from ${url}`);
	}

	return data.webSocketDebuggerUrl;
}
