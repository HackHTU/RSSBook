import { describe, expect, mock, test } from "bun:test";
import type { Browser as PuppeteerBrowser } from "puppeteer-core";
import { BrowserClosedError } from "@/utils/error";
import { Browser } from "./browser";
import {
	createFakePage,
	createFakePuppeteerBrowser,
	createFakeTarget,
	emitContextTarget,
	tick,
} from "./test-helpers";

describe("Browser", () => {
	test("enforces Browser and Context capacity and wakes FIFO waiters", async () => {
		const browser = createTestBrowser(2, 1, 1);
		const first = await browser.acquireContext();
		const second = await browser.acquireContext();
		expect(browser.created).toHaveLength(2);

		const order: number[] = [];
		const thirdPromise = browser.acquireContext().then((lease) => {
			order.push(3);
			return lease;
		});
		const fourthPromise = browser.acquireContext().then((lease) => {
			order.push(4);
			return lease;
		});
		await tick();
		expect(order).toEqual([]);

		await first.close();
		const third = await thirdPromise;
		expect(order[0]).toBe(3);
		await second.close();
		const fourth = await fourthPromise;
		expect(order).toEqual([3, 4]);

		await third.close();
		await fourth.close();
		await browser.deinit();
	});

	test("enforces Page capacity within one Context", async () => {
		const browser = createTestBrowser(1, 1, 1);
		const context = await browser.acquireContext();
		const first = await context.acquirePage();
		let acquired = false;
		const secondPromise = context.acquirePage().then((lease) => {
			acquired = true;
			return lease;
		});
		await tick();
		expect(acquired).toBeFalse();

		await first.close();
		const second = await secondPromise;
		expect(acquired).toBeTrue();
		await second.close();
		await context.close();
		await browser.deinit();
	});

	test("releases a Page reservation when newPage fails", async () => {
		const browser = createTestBrowser(1, 1, 1);
		const context = await browser.acquireContext();
		const createPage = context.context.newPage.bind(context.context);
		let attempts = 0;
		context.context.newPage = mock(async () => {
			attempts += 1;
			if (attempts === 1) throw new Error("target failed");
			return createPage();
		});

		await expect(context.acquirePage()).rejects.toThrow("target failed");
		const page = await context.acquirePage();
		expect(attempts).toBe(2);
		await page.close();
		await context.close();
		await browser.deinit();
	});

	test("closes popups that exceed Page capacity", async () => {
		const browser = createTestBrowser(1, 1, 1);
		const context = await browser.acquireContext();
		const page = await context.acquirePage();
		const popup = createFakePage();
		emitContextTarget(context.context, "targetcreated", createFakeTarget(popup));
		await tick();
		expect(popup.close).toHaveBeenCalledTimes(1);

		await page.close();
		await context.close();
		await browser.deinit();
	});

	test("supports aborting a queued acquisition", async () => {
		const browser = createTestBrowser(1, 1, 1);
		const context = await browser.acquireContext();
		const controller = new AbortController();
		const waiting = browser.acquireContext({ signal: controller.signal });
		controller.abort(new Error("cancelled"));
		await expect(waiting).rejects.toThrow("cancelled");
		await context.close();
		await browser.deinit();
	});

	test("acquirePage releases its private Context when Page closes externally", async () => {
		const browser = createTestBrowser(1, 1, 1);
		const first = await browser.acquirePage();
		await first.page.close();
		await tick();

		const second = await browser.acquirePage();
		await second.close();
		await browser.deinit();
	});

	test("does not initialize an unused pool during deinit", async () => {
		const browser = createTestBrowser(1, 1, 1);
		await browser.deinit();
		expect(browser.created).toHaveLength(0);
		await expect(browser.acquireContext()).rejects.toBeInstanceOf(BrowserClosedError);
	});

	test("replaces a disconnected physical Browser", async () => {
		const browser = createTestBrowser(1, 1, 1);
		const first = await browser.acquireContext();
		browser.created[0]?.disconnect();
		await tick();
		const second = await browser.acquireContext();
		expect(browser.created).toHaveLength(2);
		await first.close();
		await second.close();
		await browser.deinit();
	});

	test("validates direct capacity props", () => {
		expect(() => createTestBrowser(0, 1, 1)).toThrow("maxBrowsers");
		expect(() => createTestBrowser(1, 0, 1)).toThrow("maxContextsPerBrowser");
		expect(() => createTestBrowser(1, 1, 0)).toThrow("maxPagesPerContext");
	});
});

class TestBrowser extends Browser {
	public readonly created: ReturnType<typeof createFakePuppeteerBrowser>[] = [];

	protected createBrowser(): Promise<PuppeteerBrowser> {
		const fake = createFakePuppeteerBrowser();
		this.created.push(fake);
		return Promise.resolve(fake.browser);
	}
}

function createTestBrowser(
	maxBrowsers: number,
	maxContextsPerBrowser: number,
	maxPagesPerContext: number,
): TestBrowser {
	return new TestBrowser({ maxBrowsers, maxContextsPerBrowser, maxPagesPerContext });
}
