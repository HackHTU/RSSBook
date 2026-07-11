import { describe, expect, mock, test } from "bun:test";
import type { HTTPRequest } from "puppeteer-core";
import { createFakePage } from "@/browser/test-helpers";
import { allowResources, blockResources } from "./resources";

describe("browser resource utilities", () => {
	test("blocks and allows selected resources cooperatively", async () => {
		const handlers: Array<(request: HTTPRequest) => void> = [];
		const page = createFakePage({
			on: mock((event, handler) => {
				if (event === "request") handlers.push(handler);
				return page;
			}),
			setRequestInterception: mock(async () => {}),
		});
		const image = createRequest("image");
		const script = createRequest("script");
		await blockResources(page, { resourceTypes: ["image"] });
		handlers[0]?.(image.request);
		handlers[0]?.(script.request);
		await allowResources(page, { resourceTypes: ["script"] });
		handlers[1]?.(image.request);
		handlers[1]?.(script.request);
		expect(image.abort).toHaveBeenCalledTimes(2);
		expect(script.continueRequest).toHaveBeenCalledTimes(2);
	});
});

function createRequest(resourceType: "image" | "script") {
	const abort = mock(async () => {});
	const continueRequest = mock(async () => {});
	const request = {
		abort,
		continue: continueRequest,
		continueRequestOverrides: () => ({}),
		isInterceptResolutionHandled: () => false,
		resourceType: () => resourceType,
	} as unknown as HTTPRequest;
	return { abort, continueRequest, request };
}
