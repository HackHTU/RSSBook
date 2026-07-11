import puppeteer, {
	type BrowserWorker,
	type Browser as CloudflarePuppeteerBrowser,
} from "@cloudflare/puppeteer";
import { Browser, type BrowserConcurrencyOptions, type PuppeteerBrowser } from "rssbook";

export class CloudflareBrowser extends Browser {
	public constructor(
		private readonly binding: BrowserWorker,
		options: BrowserConcurrencyOptions = {},
	) {
		super({
			maxBrowsers: options.maxBrowsers ?? 1,
			maxContextsPerBrowser: options.maxContextsPerBrowser ?? 1,
			maxPagesPerContext: options.maxPagesPerContext ?? 2,
		});
	}

	protected async createBrowser(): Promise<PuppeteerBrowser> {
		const browser: CloudflarePuppeteerBrowser = await puppeteer.launch(this.binding);

		// Cloudflare and upstream Puppeteer expose the same API from different
		// package versions, so their nominal types do not unify.
		return browser as unknown as PuppeteerBrowser;
	}
}
