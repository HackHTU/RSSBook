import { describe, expect, test } from "bun:test";
import { NullCache } from "./null";

describe("NullCache", () => {
	test("never persists values", async () => {
		const cache = new NullCache();
		await cache.set("key", "value");
		expect(await cache.get("key")).toBeUndefined();
		await cache.del("key");
	});

	test("still coalesces concurrent fetches", async () => {
		const cache = new NullCache();
		let calls = 0;
		const fetcher = async () => {
			calls += 1;
			await new Promise((resolve) => setTimeout(resolve, 5));
			return "fresh";
		};

		expect(await Promise.all([cache.tryGet("key", fetcher), cache.tryGet("key", fetcher)])).toEqual(
			["fresh", "fresh"],
		);
		expect(calls).toBe(1);
		expect(await cache.get("key")).toBeUndefined();
	});
});
