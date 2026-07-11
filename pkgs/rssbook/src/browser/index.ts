export type { Browser as PuppeteerBrowser } from "puppeteer-core";
export {
	Browser,
	type BrowserAcquireOptions,
	type BrowserConcurrencyOptions,
} from "./browser";
export {
	CDPBrowser,
	type CDPBrowserEndpoint,
	type CDPBrowserEndpointResolver,
	type CDPBrowserOptions,
} from "./cdp";
export { BrowserClosedError, BrowserUnavailableError } from "./errors";
export { BrowserContextLease, BrowserPageLease } from "./lease";
export { LocalPuppeteerBrowser, type LocalPuppeteerBrowserOptions } from "./local";
