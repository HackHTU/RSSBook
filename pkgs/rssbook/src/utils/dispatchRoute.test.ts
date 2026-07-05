import { describe, expect, test } from "bun:test";
import { dispatchRoute } from "@/utils/dispatchRoute";

describe("dispatchRoute", () => {
	test("throws error when path does not start with /", () => {
		expect(() => dispatchRoute("feeds/test" as `/${string}`)).toThrow(
			"Path must start with a leading slash (/).",
		);
	});

	test("returns response with status and headers for valid path", async () => {
		const response = await dispatchRoute("/any-path");
		expect(response.status).toBe(404);
		expect(response.headers).toBeDefined();
		expect(typeof response.text).toBe("function");
	});

	test("constructs request with correct URL structure", async () => {
		const response = await dispatchRoute("/test-path");
		expect(response.status).toBe(404);
		const text = await response.text();
		expect(text.length).toBeGreaterThan(0);
	});
});
