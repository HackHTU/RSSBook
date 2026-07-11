import { describe, expect, test } from "bun:test";
import { BrowserUnavailableError } from "@/utils/error";
import { createUnavailableBrowser } from "./errors";

describe("createUnavailableBrowser", () => {
	test("fails lazily without initializing during deinit", async () => {
		const unused = createUnavailableBrowser(() => new BrowserUnavailableError());
		await unused.deinit();

		const browser = createUnavailableBrowser(() => new BrowserUnavailableError());
		await expect(browser.init()).rejects.toBeInstanceOf(BrowserUnavailableError);
	});
});
