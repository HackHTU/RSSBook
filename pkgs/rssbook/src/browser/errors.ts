import type { Browser as PuppeteerBrowserInstance } from "puppeteer";
import { Browser } from "./browser";

export class BrowserUnavailableError extends Error {
	public constructor() {
		super("This feed route requires browser support, but RSSBook was created with browser: false.");
		this.name = "BrowserUnavailableError";
	}
}

class UnavailableBrowser extends Browser {
	public constructor(private readonly createError: () => Error) {
		super(async () => {
			throw createError();
		});
	}

	public override async getBrowser(): Promise<PuppeteerBrowserInstance> {
		throw this.createError();
	}

	public override async close(): Promise<void> {
		throw this.createError();
	}
}
/**
 * Create a Browser-compatible object that fails only when browser APIs are used.
 */

export function createUnavailableBrowser(createError: () => Error): Browser {
	return new UnavailableBrowser(createError);
}
