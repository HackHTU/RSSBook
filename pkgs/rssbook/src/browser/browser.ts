import type {
	ConnectOptions,
	GoToOptions,
	LaunchOptions,
	Page,
	Browser as PuppeteerBrowserInstance,
} from "puppeteer";

export type BrowserFactory = () => PuppeteerBrowserInstance | Promise<PuppeteerBrowserInstance>;

export type BrowserDisposer = (browser: PuppeteerBrowserInstance) => void | Promise<void>;

export type BrowserDisposeMode = "close" | "disconnect";

export type BrowserOptions = BrowserFactory | BrowserProviderOptions;

export interface BrowserProviderOptions {
	/**
	 * Remote browser endpoint.
	 *
	 * `ws://` and `wss://` endpoints are passed directly to
	 * `puppeteer.connect({ browserWSEndpoint })`. `http://` and `https://`
	 * endpoints are resolved through `/json/version` and its
	 * `webSocketDebuggerUrl` field.
	 */
	endpoint?: string | URL;
	/**
	 * Create a Puppeteer browser instance lazily.
	 *
	 * Use this for Browser as a Service providers that need async session
	 * creation, authentication, or endpoint discovery before returning a
	 * Puppeteer `Browser`. When `dispose` is omitted, RSSBook only disconnects
	 * from factory-created browsers.
	 */
	create?: BrowserFactory;
	/**
	 * Cleanup behavior for browsers created by `create` or `endpoint`.
	 *
	 * `disconnect` keeps the remote browser/session alive. `close` shuts down
	 * the browser process. Pass a function when a SaaS provider requires an API
	 * call to close the session.
	 */
	dispose?: BrowserDisposeMode | BrowserDisposer;
	/** Extra options for `puppeteer.launch()` when using the local browser. */
	launch?: LaunchOptions;
	/** Extra options for `puppeteer.connect()` when using a remote endpoint. */
	connect?: Omit<ConnectOptions, "browserWSEndpoint">;
}

/**
 * RSSBook browser capability backed by Puppeteer.
 *
 * Without an endpoint it lazily launches a local browser on first use and
 * `close()` shuts that process down. With an endpoint it lazily connects to a
 * remote CDP browser and `close()` disconnects Puppeteer from that remote
 * process. Browser as a Service and serverless browser providers can either
 * expose a CDP endpoint or pass an async factory through the constructor.
 */
export class Browser {
	private readonly options: BrowserProviderOptions;
	private browser?: PuppeteerBrowserInstance;
	private opening?: Promise<PuppeteerBrowserInstance>;
	private dispose: BrowserDisposeMode | BrowserDisposer = "close";

	public constructor(options: BrowserOptions = {}) {
		this.options = typeof options === "function" ? { create: options } : options;
	}

	/**
	 * Return a Puppeteer browser instance, launching or connecting lazily when
	 * needed.
	 */
	public async getBrowser(): Promise<PuppeteerBrowserInstance> {
		if (this.browser) return this.browser;

		this.opening ??= this.createBrowser().then((browser) => {
			this.browser = browser;
			browser.once("disconnected", () => {
				if (this.browser === browser) {
					this.browser = undefined;
				}
			});

			return browser;
		});

		try {
			return await this.opening;
		} finally {
			this.opening = undefined;
		}
	}

	/**
	 * Create a new page from the underlying Puppeteer browser.
	 */
	public async newPage(): Promise<Page> {
		return (await this.getBrowser()).newPage();
	}

	/**
	 * Run a task with a new page and always close that page afterwards.
	 */
	public async withPage<T>(callback: (page: Page) => Promise<T>): Promise<T> {
		const page = await this.newPage();

		try {
			return await callback(page);
		} finally {
			await page.close();
		}
	}

	/**
	 * Render a URL with Puppeteer and return the final HTML.
	 */
	public async renderHTML(url: string, options?: GoToOptions): Promise<string> {
		return this.withPage(async (page) => {
			await page.goto(url, {
				waitUntil: "networkidle2",
				...options,
			});

			return page.content();
		});
	}

	/**
	 * Release resources owned by this browser provider.
	 */
	public async close(): Promise<void> {
		const browser = this.browser ?? (this.opening ? await this.opening : undefined);
		if (!browser) return;

		this.browser = undefined;
		this.opening = undefined;

		await this.disposeBrowser(browser);
	}

	private async createBrowser(): Promise<PuppeteerBrowserInstance> {
		if (this.options.create) {
			this.dispose = this.options.dispose ?? "disconnect";
			return this.options.create();
		}

		const puppeteer = await import("puppeteer");

		if (this.options.endpoint) {
			this.dispose = this.options.dispose ?? "disconnect";
			const browserWSEndpoint = await resolveBrowserWSEndpoint(this.options.endpoint);
			return puppeteer.connect({
				...this.options.connect,
				browserWSEndpoint,
			});
		}

		this.dispose = this.options.dispose ?? "close";
		return puppeteer.launch(this.options.launch);
	}

	private async disposeBrowser(browser: PuppeteerBrowserInstance): Promise<void> {
		if (typeof this.dispose === "function") {
			await this.dispose(browser);
			return;
		}

		if (this.dispose === "disconnect") {
			await browser.disconnect();
			return;
		}

		await browser.close();
	}
}

async function resolveBrowserWSEndpoint(endpoint: string | URL): Promise<string> {
	const url = typeof endpoint === "string" ? new URL(endpoint) : endpoint;

	if (url.protocol === "ws:" || url.protocol === "wss:") {
		return url.toString();
	}

	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new Error(`Unsupported Puppeteer browser endpoint protocol: ${url.protocol}`);
	}

	const versionURL = new URL(url);
	const pathname = versionURL.pathname.replace(/\/$/, "");
	versionURL.pathname = pathname.endsWith("/json/version") ? pathname : `${pathname}/json/version`;

	const response = await fetch(versionURL);
	if (!response.ok) {
		throw new Error(
			`Failed to resolve Puppeteer browser endpoint from ${versionURL}: ${response.status} ${response.statusText}`,
		);
	}

	const data: unknown = await response.json();
	if (
		typeof data !== "object" ||
		data === null ||
		!("webSocketDebuggerUrl" in data) ||
		typeof data.webSocketDebuggerUrl !== "string"
	) {
		throw new Error(`Invalid Puppeteer browser version response from ${versionURL}`);
	}

	return data.webSocketDebuggerUrl;
}
