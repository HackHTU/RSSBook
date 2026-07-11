import { describe, expect, mock, test } from "bun:test";
import type { HTTPResponse } from "puppeteer-core";
import { createFakePage } from "@/browser/test-helpers";
import { waitForResponse } from "./response";

describe("waitForResponse", () => {
	test("registers the waiter before its trigger", async () => {
		const order: string[] = [];
		const response = { json: mock(async () => ({ ok: true })) } as unknown as HTTPResponse;
		const page = createFakePage({
			waitForResponse: mock(async () => {
				order.push("wait");
				return response;
			}),
		});
		expect(
			await waitForResponse(
				page,
				() => true,
				async () => void order.push("trigger"),
			),
		).toBe(response);
		expect(order).toEqual(["wait", "trigger"]);
	});
});
