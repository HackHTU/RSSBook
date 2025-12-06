import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { ofetch } from "@/utils/ofetch";

let server: ReturnType<typeof Bun.serve> | null = null;
const TEST_PORT = 13579;
const BASE_URL = `http://localhost:${TEST_PORT}`;

beforeAll(() => {
	server = Bun.serve({
		port: TEST_PORT,
		routes: {
			"/404": () => new Response("Not Found", { status: 404 }),

			"/500": () => new Response("Internal Server Error", { status: 500 }),

			"/503": () => new Response("Service Unavailable", { status: 503 }),

			"/html": () =>
				new Response("<html><body>Hello World</body></html>", {
					headers: { "content-type": "text/html" },
				}),
			"/json": () => Response.json({ data: [1, 2, 3], message: "success" }),

			"/retry": (res) => {
				const url = new URL(res.url);
				const retryCount = Number(url.searchParams.get("count") ?? "0");
				if (retryCount < 2) {
					return new Response("Temporary Error", { status: 503 });
				}
				return Response.json({ message: "success after retry" });
			},

			"/slow": () =>
				new Promise((resolve) => {
					setTimeout(() => {
						resolve(Response.json({ message: "slow response" }));
					}, 10000);
				}),

			"/text": () => new Response("plain text response"),

			"/xml": () =>
				new Response('<?xml version="1.0"?><rss><item>test</item></rss>', {
					headers: { "content-type": "application/xml" },
				}),
		},
	});
});

afterAll(() => {
	server?.stop();
});

describe("ofetch", () => {
	test("should fetch JSON successfully", async () => {
		const data = await ofetch(`${BASE_URL}/json`);
		expect(data).toEqual({ data: [1, 2, 3], message: "success" });
	});

	test("should fetch XML successfully", async () => {
		const data = await ofetch(`${BASE_URL}/xml`);
		expect(data).toContain("<rss>");
		expect(data).toContain("<item>test</item>");
	});

	test("should fetch HTML successfully", async () => {
		const data = await ofetch(`${BASE_URL}/html`);
		expect(data).toContain("<body>Hello World</body>");
	});

	test("should fetch plain text successfully", async () => {
		const data = await ofetch(`${BASE_URL}/text`);
		expect(data).toBe("plain text response");
	});
});

describe("Fetch - Error handling", () => {
	test("should throw on 404 error", async () => {
		expect(ofetch(`${BASE_URL}/404`)).rejects.toThrow();
	});

	test("should throw on 500 error", async () => {
		expect(ofetch(`${BASE_URL}/500`)).rejects.toThrow();
	});

	test("should throw on 503 error", async () => {
		expect(ofetch(`${BASE_URL}/503`)).rejects.toThrow();
	});

	test("should throw on timeout", async () => {
		expect(ofetch(`${BASE_URL}/slow`)).rejects.toThrow();
	}, 10000); // Give test itself 10s to complete
});

describe("Fetch - Configuration", () => {
	test("should support custom headers", async () => {
		const data = await ofetch(`${BASE_URL}/json`, {
			headers: {
				"X-Custom-Header": "test-value",
			},
		});
		expect(data).toEqual({ data: [1, 2, 3], message: "success" });
	});

	test("should support query parameters", async () => {
		const data = await ofetch(`${BASE_URL}/json`, {
			query: { param1: "value1", param2: "value2" },
		});
		expect(data).toBeDefined();
	});
});

describe("Fetch - Response types", () => {
	test("should parse JSON automatically", async () => {
		const data = await ofetch(`${BASE_URL}/json`);
		expect(typeof data).toBe("object");
		expect(data.message).toBe("success");
	});

	test("should return text for non-JSON responses", async () => {
		const data = await ofetch(`${BASE_URL}/xml`);
		expect(typeof data).toBe("string");
	});
});
