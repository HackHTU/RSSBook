import type {
	ConnectOptions,
	GoToOptions,
	LaunchOptions,
	Page,
	Browser as PuppeteerBrowserInstance,
} from "puppeteer";
import type { Awaitable } from "@/types/utils";
import { logger } from "@/utils/logger";

/**
 * Lazily creates or returns a Puppeteer browser instance.
 *
 * Use this when the caller already owns provider/session setup and can return
 * the final Puppeteer `Browser` directly. RSSBook disconnects it by default
 * when `Browser.close()` is called.
 */
export type BrowserFactory = () => Awaitable<PuppeteerBrowserInstance>;

/**
 * Lazily resolves browser provider options.
 *
 * Use this when a SaaS or serverless provider needs async work to discover a
 * CDP endpoint, credentials, launch options, or a custom disposer before
 * Puppeteer connects or launches.
 */
export type BrowserProviderFactory = () => Awaitable<BrowserProviderOptions>;

/**
 * Custom cleanup hook for a resolved Puppeteer browser instance.
 *
 * Use this for Browser as a Service providers that need to call their own API
 * to release a session after Puppeteer disconnects or closes.
 */
export type BrowserDisposer = (browser: PuppeteerBrowserInstance) => void | Promise<void>;

/**
 * Built-in cleanup mode for a resolved browser.
 *
 * Local `puppeteer.launch()` defaults to `close`; remote endpoint and factory
 * based browsers default to `disconnect`.
 */
export type BrowserDisposeMode = "close" | "disconnect";

/**
 * Constructor input accepted by {@link Browser}.
 *
 * Passing an object configures a provider directly. Passing a function defers
 * all provider/session discovery until the first browser method is used; the
 * function may return either provider options or an already connected
 * Puppeteer browser instance.
 */
export type BrowserOptions = BrowserFactory | BrowserProviderFactory | BrowserProviderOptions;

type BrowserSource = BrowserProviderOptions | PuppeteerBrowserInstance;
type BrowserOptionsSource = BrowserProviderOptions | (() => Awaitable<BrowserSource>);

/**
 * Provider configuration for RSSBook's Puppeteer-backed browser.
 */
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
	 * Puppeteer `Browser`. This factory returns the final Puppeteer instance;
	 * use the top-level `Browser` constructor function when provider options
	 * themselves need async discovery. When `dispose` is omitted, RSSBook only
	 * disconnects from factory-created browsers.
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
 * process. Browser as a Service and serverless browser providers can expose a
 * CDP endpoint, pass an async provider factory, or pass an async factory that
 * returns an already connected Puppeteer `Browser`.
 */
export class Browser {
	private readonly options: BrowserOptionsSource;
	private browser?: PuppeteerBrowserInstance;
	private opening?: Promise<PuppeteerBrowserInstance>;
	private dispose: BrowserDisposeMode | BrowserDisposer = "close";

	public constructor(options: BrowserOptions = {}) {
		this.options = options;
	}

	/**
	 * Return a Puppeteer browser instance, launching or connecting lazily when
	 * needed.
	 */
	public async getBrowser(): Promise<PuppeteerBrowserInstance> {
		if (this.browser) {
			logger.info("[Browser] Reusing active Puppeteer browser.");
			return this.browser;
		}

		if (this.opening) {
			logger.info("[Browser] Awaiting in-flight browser initialization.");
		}

		this.opening ??= this.createBrowser().then((browser) => {
			this.browser = browser;
			logger.info("[Browser] Puppeteer browser is ready.");
			browser.once("disconnected", () => {
				logger.info("[Browser] Puppeteer browser disconnected.");
				if (this.browser === browser) {
					this.browser = undefined;
				}
			});

			return browser;
		});

		try {
			return await this.opening;
		} finally {
			logger.info("[Browser] Browser initialization promise settled.");
			this.opening = undefined;
		}
	}

	/**
	 * Create a new page from the underlying Puppeteer browser.
	 */
	public async newPage(): Promise<Page> {
		logger.info("[Browser] Creating new page.");
		const page = await (await this.getBrowser()).newPage();
		logger.info("[Browser] New page created.");
		return page;
	}

	/**
	 * Run a task with a new page and always close that page afterwards.
	 */
	public async withPage<T>(callback: (page: Page) => Promise<T>): Promise<T> {
		logger.info("[Browser] Opening managed page.");
		const page = await this.newPage();

		try {
			return await callback(page);
		} finally {
			logger.info("[Browser] Closing managed page.");
			await page.close();
			logger.info("[Browser] Managed page closed.");
		}
	}

	/**
	 * Render a URL with Puppeteer and return the final HTML.
	 */
	public async renderHTML(url: string, options?: GoToOptions): Promise<string> {
		logger.info(`[Browser] Rendering HTML: ${url}`);
		return this.withPage(async (page) => {
			await page.goto(url, {
				waitUntil: "networkidle2",
				...options,
			});
			logger.info(`[Browser] Page navigation completed: ${url}`);

			const html = await page.content();
			logger.info(`[Browser] Rendered HTML captured: ${html.length} bytes.`);
			return html;
		});
	}

	/**
	 * Release resources owned by this browser provider.
	 */
	public async close(): Promise<void> {
		logger.info("[Browser] Close requested.");
		const browser = this.browser ?? (this.opening ? await this.opening : undefined);
		if (!browser) {
			logger.info("[Browser] Close skipped; browser was never initialized.");
			return;
		}

		this.browser = undefined;
		this.opening = undefined;

		await this.disposeBrowser(browser);
		logger.info("[Browser] Close completed.");
	}

	private async createBrowser(): Promise<PuppeteerBrowserInstance> {
		logger.info("[Browser] Resolving browser source.");
		const source = await this.resolveBrowserSource();

		if (isPuppeteerBrowserInstance(source)) {
			this.dispose = "disconnect";
			logger.info("[Browser] Using provided Puppeteer browser instance.");
			return source;
		}

		return this.createFromProvider(source);
	}

	private async resolveBrowserSource(): Promise<BrowserSource> {
		if (typeof this.options === "function") {
			logger.info("[Browser] Calling browser provider factory.");
			const source = await this.options();

			if (isPuppeteerBrowserInstance(source) || isBrowserProviderOptions(source)) {
				logger.info(
					`[Browser] Browser provider factory resolved: ${describeBrowserSource(source)}.`,
				);
				return source;
			}

			throw new TypeError(
				"Browser factory must return a Puppeteer Browser instance or BrowserProviderOptions.",
			);
		}

		if (isBrowserProviderOptions(this.options)) {
			return this.options;
		}

		throw new TypeError("Browser options must be BrowserProviderOptions or a browser factory.");
	}

	private async createFromProvider(
		options: BrowserProviderOptions,
	): Promise<PuppeteerBrowserInstance> {
		if (options.create) {
			this.dispose = options.dispose ?? "disconnect";
			logger.info("[Browser] Creating Puppeteer browser from provider create().");
			const browser = await options.create();

			if (!isPuppeteerBrowserInstance(browser)) {
				throw new TypeError(
					"BrowserProviderOptions.create must return a Puppeteer Browser instance.",
				);
			}

			logger.info("[Browser] Provider create() returned Puppeteer browser.");
			return browser;
		}

		const puppeteer = await import("puppeteer");

		if (options.endpoint) {
			this.dispose = options.dispose ?? "disconnect";
			logger.info(`[Browser] Connecting to remote CDP endpoint: ${String(options.endpoint)}.`);
			const browserWSEndpoint = await resolveBrowserWSEndpoint(options.endpoint);
			logger.info(`[Browser] Resolved browser WebSocket endpoint: ${browserWSEndpoint}.`);
			return puppeteer.connect({
				...options.connect,
				browserWSEndpoint,
			});
		}

		this.dispose = options.dispose ?? "close";
		logger.info("[Browser] Launching local Puppeteer browser.");
		return puppeteer.launch(options.launch);
	}

	private async disposeBrowser(browser: PuppeteerBrowserInstance): Promise<void> {
		if (typeof this.dispose === "function") {
			logger.info("[Browser] Running custom browser disposer.");
			await this.dispose(browser);
			return;
		}

		if (this.dispose === "disconnect") {
			logger.info("[Browser] Disconnecting Puppeteer browser.");
			await browser.disconnect();
			return;
		}

		logger.info("[Browser] Closing Puppeteer browser process.");
		await browser.close();
	}
}

function describeBrowserOptions(options: BrowserOptions): string {
	if (typeof options === "function") return "factory";
	return describeProviderOptions(options);
}

function describeBrowserSource(source: BrowserSource): string {
	return isPuppeteerBrowserInstance(source)
		? "puppeteer-instance"
		: describeProviderOptions(source);
}

function describeProviderOptions(options: BrowserProviderOptions): string {
	if (options.create) return "provider-create";
	if (options.endpoint) return `endpoint:${String(options.endpoint)}`;
	return "local-launch";
}

function isObject(value: unknown): value is object {
	return typeof value === "object" && value !== null;
}

function isPlainObject(value: unknown): value is object {
	if (!isObject(value)) return false;

	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

function hasFunction(value: object, key: string): boolean {
	return typeof Reflect.get(value, key) === "function";
}

function isPuppeteerBrowserInstance(value: unknown): value is PuppeteerBrowserInstance {
	return (
		isObject(value) &&
		hasFunction(value, "newPage") &&
		hasFunction(value, "close") &&
		hasFunction(value, "disconnect") &&
		hasFunction(value, "once")
	);
}

function isBrowserProviderOptions(value: unknown): value is BrowserProviderOptions {
	if (!isPlainObject(value)) return false;

	const allowedKeys = new Set(["connect", "create", "dispose", "endpoint", "launch"]);
	for (const key of Object.keys(value)) {
		if (!allowedKeys.has(key)) return false;
	}

	const endpoint = Reflect.get(value, "endpoint");
	if (endpoint !== undefined && typeof endpoint !== "string" && !(endpoint instanceof URL)) {
		return false;
	}

	const create = Reflect.get(value, "create");
	if (create !== undefined && typeof create !== "function") {
		return false;
	}

	const dispose = Reflect.get(value, "dispose");
	if (
		dispose !== undefined &&
		dispose !== "close" &&
		dispose !== "disconnect" &&
		typeof dispose !== "function"
	) {
		return false;
	}

	const launch = Reflect.get(value, "launch");
	if (launch !== undefined && !isObject(launch)) {
		return false;
	}

	const connect = Reflect.get(value, "connect");
	if (connect !== undefined && !isObject(connect)) {
		return false;
	}

	return true;
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
