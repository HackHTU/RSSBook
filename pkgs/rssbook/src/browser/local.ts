import type { LaunchOptions, Browser as PuppeteerBrowser } from "puppeteer-core";
import { Browser, type BrowserConcurrencyOptions } from "./browser";

export interface LocalPuppeteerBrowserOptions extends BrowserConcurrencyOptions {
	launch?: LaunchOptions;
}

/** Puppeteer Core provider backed by an installed local Chromium browser. */
export class LocalPuppeteerBrowser extends Browser {
	private readonly launchOptions: LaunchOptions;

	public constructor(options: LocalPuppeteerBrowserOptions = {}) {
		super({
			maxBrowsers: options.maxBrowsers ?? 1,
			maxContextsPerBrowser: options.maxContextsPerBrowser ?? 4,
			maxPagesPerContext: options.maxPagesPerContext ?? 4,
		});
		this.launchOptions = options.launch ?? {};
	}

	protected async createBrowser(): Promise<PuppeteerBrowser> {
		const puppeteer = await import("puppeteer-core");
		const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

		return puppeteer.launch({
			...this.launchOptions,
			...(!this.launchOptions.channel && !this.launchOptions.executablePath
				? executablePath
					? { executablePath }
					: { channel: "chrome" as const }
				: {}),
		});
	}
}
