import { mock } from "bun:test";
import type { BrowserContext, Page, Browser as PuppeteerBrowser, Target } from "puppeteer-core";

export const puppeteerCalls = {
	connect: [] as string[],
	launch: [] as object[],
};
export const localPuppeteer = createFakePuppeteerBrowser();
export const remotePuppeteer = createFakePuppeteerBrowser();
const contextHandlers = new WeakMap<BrowserContext, Map<string, Array<(target: Target) => void>>>();

mock.module("puppeteer-core", () => ({
	connect: mock(async ({ browserWSEndpoint }: { browserWSEndpoint: string }) => {
		puppeteerCalls.connect.push(browserWSEndpoint);
		return remotePuppeteer.browser;
	}),
	launch: mock(async (options: object) => {
		puppeteerCalls.launch.push(options);
		return localPuppeteer.browser;
	}),
}));

export function createFakePuppeteerBrowser() {
	let disconnected: (() => void) | undefined;
	let browser: PuppeteerBrowser;
	const contexts: BrowserContext[] = [];
	browser = {
		close: mock(async () => {}),
		createBrowserContext: mock(async () => {
			const context = createFakeContext();
			contexts.push(context);
			return context;
		}),
		disconnect: mock(async () => {}),
		newPage: mock(async () => createFakePage()),
		once: mock((event, handler) => {
			if (event === "disconnected") disconnected = handler;
			return browser;
		}),
	} as unknown as PuppeteerBrowser;
	return { browser, contexts, disconnect: () => disconnected?.() };
}

export function createFakeContext(overrides: Partial<BrowserContext> = {}): BrowserContext {
	let closed = false;
	const handlers = new Map<string, Array<(target: Target) => void>>();
	let context: BrowserContext;
	context = {
		close: mock(async () => {
			closed = true;
		}),
		get closed() {
			return closed;
		},
		cookies: mock(async () => []),
		newPage: mock(async () => {
			const page = createFakePage();
			for (const handler of handlers.get("targetcreated") ?? []) handler(page.target());
			return page;
		}),
		on: mock((event, handler) => {
			const entries = handlers.get(String(event)) ?? [];
			entries.push(handler);
			handlers.set(String(event), entries);
			return context;
		}),
		setCookie: mock(async () => {}),
		...overrides,
	} as unknown as BrowserContext;
	contextHandlers.set(context, handlers);
	return context;
}

export function createFakeTarget(page = createFakePage()): Target {
	return {
		page: async () => page,
		type: () => "page",
	} as Target;
}

export function emitContextTarget(
	context: BrowserContext,
	event: "targetcreated" | "targetdestroyed",
	target: Target,
): void {
	for (const handler of contextHandlers.get(context)?.get(event) ?? []) handler(target);
}

export function createFakePage(overrides: Partial<Page> = {}): Page {
	let closed = false;
	const closeHandlers: Array<() => void> = [];
	let page: Page;
	const target = {
		page: async () => page,
		type: () => "page",
	} as Target;
	page = {
		close: mock(async () => {
			if (closed) return;
			closed = true;
			for (const handler of closeHandlers) handler();
		}),
		content: mock(async () => "<html></html>"),
		goto: mock(async () => null),
		isClosed: mock(() => closed),
		once: mock((event, handler) => {
			if (event === "close") closeHandlers.push(handler);
			return page;
		}),
		target: mock(() => target),
		...overrides,
	} as unknown as Page;
	return page;
}

export async function tick(): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 0));
}
