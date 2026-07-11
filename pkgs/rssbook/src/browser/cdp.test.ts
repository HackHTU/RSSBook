import { afterEach, describe, expect, mock, test } from "bun:test";
import { CDPBrowser } from "./cdp";
import { puppeteerCalls, remotePuppeteer } from "./test-helpers";

const originalFetch = globalThis.fetch;
afterEach(() => {
	mock.clearAllMocks();
	puppeteerCalls.connect.length = 0;
	globalThis.fetch = originalFetch;
});

describe("CDPBrowser", () => {
	test("resolves Browser-as-a-Service sessions lazily", async () => {
		const endpoint = mock(async () => "wss://browser.example/lazy-session");
		const browser = new CDPBrowser({ endpoint });

		expect(endpoint).not.toHaveBeenCalled();
		await browser.init();
		expect(endpoint).toHaveBeenCalledTimes(1);
		expect(puppeteerCalls.connect).toEqual(["wss://browser.example/lazy-session"]);
		await browser.deinit();
	});

	test("resolves one endpoint for each physical Browser slot", async () => {
		let session = 0;
		const endpoint = mock(async () => {
			session += 1;
			return `wss://browser.example/session-${session}`;
		});
		const browser = new CDPBrowser({
			endpoint,
			maxBrowsers: 2,
			maxContextsPerBrowser: 1,
		});

		const first = await browser.acquireContext();
		const second = await browser.acquireContext();
		expect(endpoint).toHaveBeenCalledTimes(2);
		expect(puppeteerCalls.connect).toEqual([
			"wss://browser.example/session-1",
			"wss://browser.example/session-2",
		]);
		await first.close();
		await second.close();
		await browser.deinit();
	});

	test("discovers a WebSocket endpoint over HTTP", async () => {
		globalThis.fetch = Object.assign(
			mock(async () => Response.json({ webSocketDebuggerUrl: "wss://browser.example/session" })),
			{ preconnect: originalFetch.preconnect },
		);
		const browser = new CDPBrowser({ endpoint: "https://browser.example/cdp" });
		await browser.init();
		expect(puppeteerCalls.connect).toEqual(["wss://browser.example/session"]);
		await browser.deinit();
		expect(remotePuppeteer.browser.disconnect).toHaveBeenCalledTimes(1);
	});

	test("can close an owned remote session", async () => {
		const browser = new CDPBrowser({
			endpoint: "wss://browser.example/session",
			shutdown: "close",
		});
		await browser.init();
		await browser.deinit();
		expect(remotePuppeteer.browser.close).toHaveBeenCalled();
	});
});
