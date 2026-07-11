import type { Browser as PuppeteerBrowser } from "puppeteer-core";
import { Browser } from "./browser";

export { BrowserClosedError, BrowserUnavailableError } from "@/utils/error";

/** Create a Browser that fails lazily when browser support is used. */
export function createUnavailableBrowser(createError: () => Error): Browser {
	return new UnavailableBrowser(createError);
}

class UnavailableBrowser extends Browser {
	public constructor(private readonly createError: () => Error) {
		super({ maxBrowsers: 1, maxContextsPerBrowser: 1, maxPagesPerContext: 1 });
	}

	protected createBrowser(): Promise<PuppeteerBrowser> {
		return Promise.reject(this.createError());
	}
}
