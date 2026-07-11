import type { ConnectOptions, Browser as PuppeteerBrowser } from "puppeteer-core";
import type { Awaitable } from "@/types/utils";
import { resolveBrowserWSEndpoint } from "@/utils/browser/cdp";
import { Browser, type BrowserConcurrencyOptions } from "./browser";

export type CDPBrowserEndpoint = string | URL;
export type CDPBrowserEndpointResolver = () => Awaitable<CDPBrowserEndpoint>;

export interface CDPBrowserOptions extends BrowserConcurrencyOptions {
	connect?: Omit<ConnectOptions, "browserWSEndpoint">;
	/** Static endpoint or lazy Browser-as-a-Service session resolver. */
	endpoint: CDPBrowserEndpoint | CDPBrowserEndpointResolver;
	shutdown?: "close" | "disconnect";
}

/** Puppeteer Core provider connected to a remote CDP endpoint. */
export class CDPBrowser extends Browser {
	private readonly connectOptions?: Omit<ConnectOptions, "browserWSEndpoint">;
	private readonly endpoint: CDPBrowserEndpoint | CDPBrowserEndpointResolver;
	private readonly shutdown: "close" | "disconnect";

	public constructor(options: CDPBrowserOptions) {
		super({
			maxBrowsers: options.maxBrowsers ?? 1,
			maxContextsPerBrowser: options.maxContextsPerBrowser ?? 4,
			maxPagesPerContext: options.maxPagesPerContext ?? 4,
		});
		this.connectOptions = options.connect;
		this.endpoint = options.endpoint;
		this.shutdown = options.shutdown ?? "disconnect";
	}

	protected async createBrowser(): Promise<PuppeteerBrowser> {
		const puppeteer = await import("puppeteer-core");
		const endpoint = typeof this.endpoint === "function" ? await this.endpoint() : this.endpoint;
		return puppeteer.connect({
			...this.connectOptions,
			browserWSEndpoint: await resolveBrowserWSEndpoint(endpoint),
		});
	}

	protected override async closeBrowser(browser: PuppeteerBrowser): Promise<void> {
		if (this.shutdown === "close") {
			await browser.close();
			return;
		}
		await browser.disconnect();
	}
}
