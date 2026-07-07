import { describe, expect, mock, test } from "bun:test";
import { Elysia } from "elysia";
import type { Cookie, HTTPResponse, Page, Browser as PuppeteerBrowserInstance } from "puppeteer";
import { initPlugin } from "@/plugins";
import { EMPTY_DATA } from "@/types";
import { Source } from "@/utils";
import {
	Browser,
	BrowserRouteNotEnabledError,
	BrowserUnavailableError,
	blockResources,
	cookieHeaderToParams,
	cookiesToHeader,
	waitForResponseJSON,
} from ".";

const puppeteerCalls = {
	connect: [] as string[],
	launch: 0,
};

let localBrowser: PuppeteerBrowserInstance;
localBrowser = {
	close: mock(async () => {}),
	disconnect: mock(async () => {}),
	newPage: mock(async () => createFakePage()),
	once: mock(() => localBrowser),
} as unknown as PuppeteerBrowserInstance;

let remoteBrowser: PuppeteerBrowserInstance;
remoteBrowser = {
	close: mock(async () => {}),
	disconnect: mock(async () => {}),
	newPage: mock(async () => createFakePage()),
	once: mock(() => remoteBrowser),
} as unknown as PuppeteerBrowserInstance;

mock.module("puppeteer", () => ({
	connect: mock(async ({ browserWSEndpoint }: { browserWSEndpoint: string }) => {
		puppeteerCalls.connect.push(browserWSEndpoint);
		return remoteBrowser;
	}),
	launch: mock(async () => {
		puppeteerCalls.launch += 1;
		return localBrowser;
	}),
}));

class TestBrowser extends Browser {
	public closeCount = 0;
	public page = createFakePage();

	public async getBrowser(): Promise<PuppeteerBrowserInstance> {
		return {
			newPage: async () => this.page,
		} as PuppeteerBrowserInstance;
	}

	public async close(): Promise<void> {
		this.closeCount += 1;
	}
}

function createFakePage(overrides: Partial<Page> = {}): Page {
	return {
		close: mock(async () => {}),
		content: mock(async () => "<html></html>"),
		goto: mock(async () => null),
		...overrides,
	} as Page;
}

function createFakeBrowser(): PuppeteerBrowserInstance {
	let browser: PuppeteerBrowserInstance;
	browser = {
		close: mock(async () => {}),
		disconnect: mock(async () => {}),
		newPage: mock(async () => createFakePage()),
		once: mock(() => browser),
	} as unknown as PuppeteerBrowserInstance;

	return browser;
}

describe("browser", () => {
	test("withPage closes page on success and failure", async () => {
		const browser = new TestBrowser();

		await expect(browser.withPage(async () => "ok")).resolves.toBe("ok");
		expect(browser.page.close).toHaveBeenCalledTimes(1);

		browser.page = createFakePage();
		await expect(
			browser.withPage(async () => {
				throw new Error("boom");
			}),
		).rejects.toThrow("boom");
		expect(browser.page.close).toHaveBeenCalledTimes(1);
	});

	test("renderHTML navigates with network idle by default", async () => {
		const browser = new TestBrowser();

		await expect(browser.renderHTML("https://example.com")).resolves.toBe("<html></html>");
		expect(browser.page.goto).toHaveBeenCalledWith("https://example.com", {
			waitUntil: "networkidle2",
		});
	});

	test("Browser launches local browser lazily", async () => {
		puppeteerCalls.launch = 0;
		const browser = new Browser();

		expect(puppeteerCalls.launch).toBe(0);
		await browser.getBrowser();
		await browser.getBrowser();

		expect(puppeteerCalls.launch).toBe(1);
		await browser.close();
		expect(localBrowser.close).toHaveBeenCalled();
	});

	test("Browser connects to ws endpoint and disconnects on close", async () => {
		puppeteerCalls.connect = [];
		const endpoint = "wss://browser.example/devtools/browser/session";
		const browser = new Browser({ endpoint });

		await browser.getBrowser();
		expect(puppeteerCalls.connect).toEqual([endpoint]);

		await browser.close();
		expect(remoteBrowser.disconnect).toHaveBeenCalled();
	});

	test("Browser resolves http CDP endpoint through /json/version", async () => {
		puppeteerCalls.connect = [];
		const server = Bun.serve({
			fetch: (request) => {
				expect(new URL(request.url).pathname).toBe("/cdp/json/version");
				return Response.json({
					webSocketDebuggerUrl: "ws://127.0.0.1/devtools/browser/from-http",
				});
			},
			port: 0,
		});

		try {
			const browser = new Browser({
				endpoint: `http://${server.hostname}:${server.port}/cdp`,
			});
			await browser.getBrowser();
			expect(puppeteerCalls.connect).toEqual(["ws://127.0.0.1/devtools/browser/from-http"]);
		} finally {
			await server.stop();
		}
	});

	test("Browser accepts an async factory and disconnects by default", async () => {
		const launchCount = puppeteerCalls.launch;
		const factoryBrowser = createFakeBrowser();
		const create = mock(async () => factoryBrowser);
		const browser = new Browser(create);

		await browser.getBrowser();
		await browser.getBrowser();

		expect(puppeteerCalls.launch).toBe(launchCount);
		expect(create).toHaveBeenCalledTimes(1);
		await browser.close();
		expect(factoryBrowser.disconnect).toHaveBeenCalledTimes(1);
		expect(factoryBrowser.close).toHaveBeenCalledTimes(0);
	});

	test("Browser supports custom async disposer for SaaS sessions", async () => {
		const factoryBrowser = createFakeBrowser();
		const create = mock(async () => factoryBrowser);
		const dispose = mock(async (browser: PuppeteerBrowserInstance) => {
			expect(browser).toBe(factoryBrowser);
		});
		const browser = new Browser({ create, dispose });

		await browser.getBrowser();
		await browser.close();

		expect(create).toHaveBeenCalledTimes(1);
		expect(dispose).toHaveBeenCalledTimes(1);
		expect(factoryBrowser.disconnect).toHaveBeenCalledTimes(0);
		expect(factoryBrowser.close).toHaveBeenCalledTimes(0);
	});
});

describe("browser helpers", () => {
	test("blockResources aborts configured resource types", async () => {
		const abort = mock(async () => {});
		const continueRequest = mock(async () => {});
		let requestHandler:
			| ((request: {
					resourceType: () => "image" | "script";
					abort: typeof abort;
					continue: typeof continueRequest;
			  }) => void)
			| undefined;
		const page = createFakePage({
			on: mock((event, handler) => {
				if (event === "request") {
					requestHandler = handler;
				}
				return page;
			}),
			setRequestInterception: mock(async () => {}),
		});

		await blockResources(page, ["image"]);
		requestHandler?.({
			abort,
			continue: continueRequest,
			resourceType: () => "image",
		});
		requestHandler?.({
			abort,
			continue: continueRequest,
			resourceType: () => "script",
		});

		expect(page.setRequestInterception).toHaveBeenCalledWith(true);
		expect(abort).toHaveBeenCalledTimes(1);
		expect(continueRequest).toHaveBeenCalledTimes(1);
	});

	test("waitForResponseJSON waits, triggers, and parses JSON", async () => {
		const trigger = mock(async () => {});
		const response = {
			json: mock(async () => ({ ok: true })),
		} satisfies Partial<HTTPResponse>;
		const page = createFakePage({
			waitForResponse: mock(async () => response as unknown as HTTPResponse),
		});

		await expect(waitForResponseJSON<{ ok: boolean }>(page, () => true, trigger)).resolves.toEqual({
			ok: true,
		});
		expect(trigger).toHaveBeenCalled();
	});

	test("converts cookie headers", () => {
		const cookies = [
			{ name: "a", value: "1" },
			{ name: "space", value: "hello world" },
		] satisfies Pick<Cookie, "name" | "value">[];

		expect(cookiesToHeader(cookies)).toBe("a=1; space=hello%20world");
		expect(cookieHeaderToParams("a=1; space=hello%20world", "https://example.com")).toEqual([
			{ name: "a", url: "https://example.com", value: "1" },
			{ name: "space", url: "https://example.com", value: "hello world" },
		]);
	});
});

describe("browser source route", () => {
	test("exposes browser context and enables it only for routes with browser metadata", async () => {
		const browser = new TestBrowser();
		const source = new Source({
			description: "Test description",
			domain: "https://example.com",
			slug: "example",
			title: "Example Source",
		} as const);

		source.feed(
			{
				browser: true,
				description: "Rendered route",
				language: "en",
				maintainer: { name: "Tester" },
				title: "rendered",
			},
			(app) =>
				app.get("/rendered", ({ browser: injectedBrowser }) => {
					expect(injectedBrowser).toBe(browser);
					return EMPTY_DATA;
				}),
		);

		source.feed(
			{
				description: "Plain route",
				language: "en",
				maintainer: { name: "Tester" },
				title: "plain",
			},
			(app) =>
				app.get("/plain", (ctx) => {
					expect("browser" in ctx).toBe(true);
					return EMPTY_DATA;
				}),
		);

		const app = new Elysia().use(initPlugin({ browser })).use(source.getApp());

		expect(await app.handle(new Request("https://example.com/example/rendered"))).toHaveProperty(
			"status",
			200,
		);
		expect(await app.handle(new Request("https://example.com/example/plain"))).toHaveProperty(
			"status",
			200,
		);
	});

	test("throws clear error when a route uses browser without browser metadata", async () => {
		const browser = new TestBrowser();
		const source = new Source({
			description: "Test description",
			domain: "https://example.com",
			slug: "example",
			title: "Example Source",
		} as const);

		source.feed(
			{
				description: "Plain route",
				language: "en",
				maintainer: { name: "Tester" },
				title: "plain",
			},
			(app) =>
				app.get("/plain", async ({ browser }) => {
					await browser.getBrowser();
					return EMPTY_DATA;
				}),
		);

		const app = new Elysia().use(initPlugin({ browser })).use(source.getApp());
		const response = await app.handle(new Request("https://example.com/example/plain"));

		expect(response.status).toBe(500);
		expect(await response.text()).toContain(
			new BrowserRouteNotEnabledError("/example/plain").message,
		);
	});

	test("accepts an async browser factory from app initialization", async () => {
		const factoryBrowser = createFakeBrowser();
		const create = mock(async () => factoryBrowser);
		const source = new Source({
			description: "Test description",
			domain: "https://example.com",
			slug: "example",
			title: "Example Source",
		} as const);

		source.feed(
			{
				browser: true,
				description: "Rendered route",
				language: "en",
				maintainer: { name: "Tester" },
				title: "rendered",
			},
			(app) =>
				app.get("/rendered", async ({ browser }) => {
					expect(await browser.getBrowser()).toBe(factoryBrowser);
					return EMPTY_DATA;
				}),
		);

		const app = new Elysia().use(initPlugin({ browser: create })).use(source.getApp());
		const response = await app.handle(new Request("https://example.com/example/rendered"));

		expect(response.status).toBe(200);
		expect(create).toHaveBeenCalledTimes(1);
	});

	test("throws clear error when app disables browser for a browser route", async () => {
		const source = new Source({
			description: "Test description",
			domain: "https://example.com",
			slug: "example",
			title: "Example Source",
		} as const);

		source.feed(
			{
				browser: true,
				description: "Rendered route",
				language: "en",
				maintainer: { name: "Tester" },
				title: "rendered",
			},
			(app) =>
				app.get("/rendered", async ({ browser }) => {
					await browser.getBrowser();
					return EMPTY_DATA;
				}),
		);

		const app = new Elysia().use(initPlugin({ browser: false })).use(source.getApp());
		const response = await app.handle(new Request("https://example.com/example/rendered"));

		expect(response.status).toBe(500);
		expect(await response.text()).toContain(new BrowserUnavailableError().message);
	});

	test("adds Browser information to route description only when enabled", () => {
		const source = new Source({
			description: "Test description",
			domain: "https://example.com",
			slug: "example",
			title: "Example Source",
		} as const);

		source.feed(
			{
				browser: true,
				description: "Rendered route",
				language: "en",
				maintainer: { name: "Tester" },
				title: "rendered",
			},
			(app) => app.get("/rendered", () => EMPTY_DATA),
		);
		source.feed(
			{
				description: "Plain route",
				language: "en",
				maintainer: { name: "Tester" },
				title: "plain",
			},
			(app) => app.get("/plain", () => EMPTY_DATA),
		);

		const routes = source.getApp().routes;
		const rendered = routes.find((route) => route.path === "/example/rendered") as
			| { hooks?: { detail?: { description?: string } } }
			| undefined;
		const plain = routes.find((route) => route.path === "/example/plain") as
			| { hooks?: { detail?: { description?: string } } }
			| undefined;

		expect(rendered?.hooks?.detail?.description).toContain("**Browser**: Enabled");
		expect(plain?.hooks?.detail?.description).not.toContain("**Browser**");
	});
});
