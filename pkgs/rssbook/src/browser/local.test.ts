import { afterEach, describe, expect, test } from "bun:test";
import { LocalPuppeteerBrowser } from "./local";
import { puppeteerCalls } from "./test-helpers";

const previousExecutablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

afterEach(() => {
	puppeteerCalls.launch.length = 0;
	if (previousExecutablePath === undefined) delete process.env.PUPPETEER_EXECUTABLE_PATH;
	else process.env.PUPPETEER_EXECUTABLE_PATH = previousExecutablePath;
});

describe("LocalPuppeteerBrowser", () => {
	test("launches stable local Chrome lazily", async () => {
		delete process.env.PUPPETEER_EXECUTABLE_PATH;
		const browser = new LocalPuppeteerBrowser();
		await browser.init();
		await browser.init();
		expect(puppeteerCalls.launch).toEqual([{ channel: "chrome" }]);
		await browser.deinit();
	});

	test("uses the environment executable path", async () => {
		process.env.PUPPETEER_EXECUTABLE_PATH = "/env/chrome";
		const browser = new LocalPuppeteerBrowser();
		await browser.init();
		expect(puppeteerCalls.launch).toEqual([{ executablePath: "/env/chrome" }]);
		await browser.deinit();
	});

	test("prefers explicit launch configuration", async () => {
		process.env.PUPPETEER_EXECUTABLE_PATH = "/env/chrome";
		const browser = new LocalPuppeteerBrowser({ launch: { executablePath: "/opt/chromium" } });
		await browser.init();
		expect(puppeteerCalls.launch).toEqual([{ executablePath: "/opt/chromium" }]);
		await browser.deinit();
	});
});
