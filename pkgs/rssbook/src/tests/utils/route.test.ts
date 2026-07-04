import { describe, expect, test } from "bun:test";
import { dispatchRoute } from "@/utils/dispatchRoute";

function isXML(text: string): boolean {
	return /^\s*<\?xml\s+version=/.test(text);
}

describe.todo("route", () => {
	test("route a test feed", async () => {
		const response = await dispatchRoute("/feeds/school/htu/www/8954");
		const text = await response.text();

		expect(isXML(text)).toBe(true);
	});

	test("route test util function", async () => {
		const response = await dispatchRoute(
			"/utils/sort/?feed=https%3A%2F%2Fwww.ruanyifeng.com%2Fblog%2Fatom.xml",
		);
		const text = await response.text();

		expect(isXML(text)).toBe(true);
	});
});
