import { afterEach, describe, expect, mock, test } from "bun:test";
import { BrowserEndpointError, UnsupportedProtocolError } from "@/utils/error";
import { resolveBrowserWSEndpoint } from "./cdp";

const originalFetch = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = originalFetch;
});

describe("resolveBrowserWSEndpoint", () => {
	test("passes through WebSocket endpoints", async () => {
		await expect(resolveBrowserWSEndpoint("wss://example.com/session")).resolves.toBe(
			"wss://example.com/session",
		);
	});

	test("discovers HTTP endpoints through /json/version", async () => {
		globalThis.fetch = Object.assign(
			mock(async (url: string | URL | Request) => {
				expect(String(url)).toBe("https://example.com/cdp/json/version");
				return Response.json({ webSocketDebuggerUrl: "wss://example.com/session" });
			}),
			{ preconnect: originalFetch.preconnect },
		);
		await expect(resolveBrowserWSEndpoint("https://example.com/cdp")).resolves.toBe(
			"wss://example.com/session",
		);
	});

	test("rejects unsupported and invalid endpoints", async () => {
		await expect(resolveBrowserWSEndpoint("ftp://example.com")).rejects.toBeInstanceOf(
			UnsupportedProtocolError,
		);
		globalThis.fetch = Object.assign(
			mock(async () => Response.json({})),
			{
				preconnect: originalFetch.preconnect,
			},
		);
		await expect(resolveBrowserWSEndpoint("https://example.com")).rejects.toBeInstanceOf(
			BrowserEndpointError,
		);
	});
});
