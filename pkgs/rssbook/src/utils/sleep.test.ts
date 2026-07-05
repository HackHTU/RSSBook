import { describe, expect, test } from "bun:test";
import { sleep } from "@/utils";

describe("sleep", () => {
	test("sleep function", async () => {
		const start = Date.now();
		await sleep(100);
		const end = Date.now();
		expect(end - start).toBeGreaterThanOrEqual(100);
	});
});
