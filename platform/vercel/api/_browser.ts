import chromium from "@sparticuz/chromium-min";
import puppeteer, { type Browser as PuppeteerBrowser } from "puppeteer-core";
import { Browser, type BrowserConcurrencyOptions } from "rssbook";

export class VercelChromiumBrowser extends Browser {
	public constructor(options: BrowserConcurrencyOptions = {}) {
		super({
			maxBrowsers: options.maxBrowsers ?? 1,
			maxContextsPerBrowser: options.maxContextsPerBrowser ?? 1,
			maxPagesPerContext: options.maxPagesPerContext ?? 2,
		});
	}

	protected async createBrowser(): Promise<PuppeteerBrowser> {
		const localExecutablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
		if (localExecutablePath) {
			return puppeteer.launch({
				executablePath: localExecutablePath,
				headless: true,
			});
		}

		const packURL = process.env.CHROMIUM_PACK_URL;
		if (!packURL) {
			throw new Error("CHROMIUM_PACK_URL is required to launch Chromium on Vercel.");
		}

		return puppeteer.launch({
			args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
			executablePath: await chromium.executablePath(packURL),
			headless: "shell",
		});
	}
}
