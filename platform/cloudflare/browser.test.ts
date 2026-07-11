import { describe, expect, mock, test } from "bun:test";
import type { BrowserWorker } from "@cloudflare/puppeteer";
import type { PuppeteerBrowser } from "rssbook";
import { CloudflareBrowser } from "./browser";

const launchedBindings: BrowserWorker[] = [];
mock.module("@cloudflare/puppeteer", () => ({
	default: {
		launch: mock(async (binding: BrowserWorker) => {
			launchedBindings.push(binding);
			return createFakeBrowser();
		}),
	},
}));

describe("CloudflareBrowser", () => {
	test("uses conservative Browser Rendering capacity defaults", () => {
		const browser = new CloudflareBrowser(createBinding());
		expect(browser.maxBrowsers).toBe(1);
		expect(browser.maxContextsPerBrowser).toBe(1);
		expect(browser.maxPagesPerContext).toBe(2);
	});

	test("launches Cloudflare Puppeteer with the configured binding", async () => {
		const binding = createBinding();
		const browser = new CloudflareBrowser(binding);
		await browser.init();
		expect(launchedBindings.at(-1)).toBe(binding);
		await browser.deinit();
	});

	test("allows direct capacity overrides", () => {
		const browser = new CloudflareBrowser(createBinding(), {
			maxBrowsers: 2,
			maxContextsPerBrowser: 3,
			maxPagesPerContext: 4,
		});
		expect(browser.maxBrowsers).toBe(2);
		expect(browser.maxContextsPerBrowser).toBe(3);
		expect(browser.maxPagesPerContext).toBe(4);
	});
});

function createBinding(): BrowserWorker {
	return { fetch };
}

function createFakeBrowser(): PuppeteerBrowser {
	let browser: PuppeteerBrowser;
	browser = {
		close: mock(async () => {}),
		createBrowserContext: mock(async () => {
			throw new Error("not used");
		}),
		newPage: mock(async () => {
			throw new Error("not used");
		}),
		once: mock(() => browser),
	} as unknown as PuppeteerBrowser;
	return browser;
}
