import { describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { errorHandlerPlugin } from "./errorHandler";
import { InvalidUrlError } from "@/utils/error";

describe("errorHandlerPlugin", () => {
	test("renders an HTML error response for thrown errors", async () => {
		const app = new Elysia().use(errorHandlerPlugin).get("/broken", () => {
			throw new Error("Feed route failed");
		});

		const response = await app.handle(new Request("http://localhost/broken"));
		const html = await response.text();

		expect(response.status).toBe(500);
		expect(response.headers.get("content-type")).toBe("text/html");
		expect(html.match(/<p[^>]*>\s*(Feed route failed)\s*<\/p>/)?.[1]).toBe("Feed route failed");
	});

	test("uses the status from RSSBookError instances", async () => {
		const app = new Elysia().use(errorHandlerPlugin).get("/broken", () => {
			throw new InvalidUrlError();
		});

		const response = await app.handle(new Request("http://localhost/broken"));

		expect(response.status).toBe(400);
	});
});
