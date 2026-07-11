import { describe, expect, mock, test } from "bun:test";
import type { Cookie } from "puppeteer-core";
import { createFakeContext } from "@/browser/test-helpers";
import {
	cookieHeaderToCookies,
	cookiesToHeader,
	getCookieHeader,
	setCookieHeader,
} from "./cookies";

describe("browser cookie utilities", () => {
	test("preserves Cookie values without URI rewriting", () => {
		expect(cookiesToHeader([{ name: "token", value: "a=b==" }])).toBe("token=a=b==");
		expect(cookieHeaderToCookies("token=a=b==", "https://example.com/path")).toEqual([
			{ domain: "example.com", name: "token", path: "/", secure: true, value: "a=b==" },
		]);
	});

	test("reads and applies Cookie headers through BrowserContext", async () => {
		const cookies = [{ name: "token", value: "value" }] as Cookie[];
		const context = createFakeContext({ cookies: mock(async () => cookies) });
		await expect(getCookieHeader(context)).resolves.toBe("token=value");
		await setCookieHeader(context, "token=value", "https://example.com");
		expect(context.setCookie).toHaveBeenCalledWith({
			domain: "example.com",
			name: "token",
			path: "/",
			secure: true,
			value: "value",
		});
	});
});
