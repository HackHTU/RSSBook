import { afterEach, describe, expect, mock, test } from "bun:test";
import type { Browser as PuppeteerBrowser } from "puppeteer-core";
import { VercelChromiumBrowser } from "./_browser";

const launchOptions: object[] = [];
const executablePaths: string[] = [];

mock.module("puppeteer-core", () => ({
	default: {
		defaultArgs: mock(async ({ args }: { args: string[] }) => ["--default", ...args]),
		launch: mock(async (options: object) => {
			launchOptions.push(options);
			return createFakeBrowser();
		}),
	},
}));

mock.module("@sparticuz/chromium-min", () => ({
	default: {
		args: ["--serverless"],
		executablePath: mock(async (url: string) => {
			executablePaths.push(url);
			return "/tmp/chromium";
		}),
	},
}));

const previousExecutablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
const previousPackURL = process.env.CHROMIUM_PACK_URL;

afterEach(() => {
	launchOptions.length = 0;
	executablePaths.length = 0;
	restoreEnv("PUPPETEER_EXECUTABLE_PATH", previousExecutablePath);
	restoreEnv("CHROMIUM_PACK_URL", previousPackURL);
});

describe("VercelChromiumBrowser", () => {
	test("uses conservative serverless capacity defaults", () => {
		const browser = new VercelChromiumBrowser();
		expect(browser.maxBrowsers).toBe(1);
		expect(browser.maxContextsPerBrowser).toBe(1);
		expect(browser.maxPagesPerContext).toBe(2);
	});

	test("uses PUPPETEER_EXECUTABLE_PATH for local development", async () => {
		process.env.PUPPETEER_EXECUTABLE_PATH = "/Applications/Chromium";
		delete process.env.CHROMIUM_PACK_URL;
		const browser = new VercelChromiumBrowser();
		await browser.init();
		expect(launchOptions).toEqual([{ executablePath: "/Applications/Chromium", headless: true }]);
		expect(executablePaths).toEqual([]);
		await browser.deinit();
	});

	test("downloads the configured Chromium pack in production", async () => {
		delete process.env.PUPPETEER_EXECUTABLE_PATH;
		process.env.CHROMIUM_PACK_URL = "https://example.com/chromium-pack.tar";
		const browser = new VercelChromiumBrowser();
		await browser.init();
		expect(executablePaths).toEqual(["https://example.com/chromium-pack.tar"]);
		expect(launchOptions).toEqual([
			{
				args: ["--default", "--serverless"],
				executablePath: "/tmp/chromium",
				headless: "shell",
			},
		]);
		await browser.deinit();
	});

	test("requires CHROMIUM_PACK_URL in production", async () => {
		delete process.env.PUPPETEER_EXECUTABLE_PATH;
		delete process.env.CHROMIUM_PACK_URL;
		const browser = new VercelChromiumBrowser();
		await expect(browser.init()).rejects.toThrow("CHROMIUM_PACK_URL");
	});
});

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

function restoreEnv(name: string, value: string | undefined): void {
	if (value === undefined) delete process.env[name];
	else process.env[name] = value;
}
