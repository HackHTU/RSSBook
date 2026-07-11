import type { HTTPRequest, Page, ResourceType } from "puppeteer-core";

const DEFAULT_BLOCKED_RESOURCES = ["image", "media", "font"] satisfies ResourceType[];
const DEFAULT_INTERCEPT_PRIORITY = 0;

export interface ResourceFilterOptions {
	priority?: number;
	resourceTypes?: readonly ResourceType[];
}

/** Block selected resource types while allowing every other request. */
export async function blockResources(
	page: Page,
	options: ResourceFilterOptions = {},
): Promise<void> {
	const resourceTypes = new Set(options.resourceTypes ?? DEFAULT_BLOCKED_RESOURCES);
	await filterResources(page, (request) => !resourceTypes.has(request.resourceType()), options);
}

/** Allow selected resource types while blocking every other request. */
export async function allowResources(page: Page, options: ResourceFilterOptions): Promise<void> {
	const resourceTypes = new Set(options.resourceTypes ?? []);
	await filterResources(page, (request) => resourceTypes.has(request.resourceType()), options);
}

async function filterResources(
	page: Page,
	allow: (request: HTTPRequest) => boolean,
	options: ResourceFilterOptions,
): Promise<void> {
	const priority = options.priority ?? DEFAULT_INTERCEPT_PRIORITY;

	await page.setRequestInterception(true);
	page.on("request", (request) => {
		if (request.isInterceptResolutionHandled()) return;

		if (allow(request)) {
			void request.continue(request.continueRequestOverrides(), priority);
			return;
		}

		void request.abort(undefined, priority);
	});
}
