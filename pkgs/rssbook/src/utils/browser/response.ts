import type { HTTPResponse, Page, WaitTimeoutOptions } from "puppeteer-core";
import type { Awaitable } from "@/types/utils";

/** Register a response waiter before optionally triggering navigation or interaction. */
export async function waitForResponse(
	page: Page,
	predicate: string | ((response: HTTPResponse) => Awaitable<boolean>),
	trigger?: () => Awaitable<void>,
	options?: WaitTimeoutOptions,
): Promise<HTTPResponse> {
	const responsePromise = page.waitForResponse(predicate, options);
	await trigger?.();
	return responsePromise;
}
