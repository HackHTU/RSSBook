import { describe, expect, test } from "bun:test";
import { MemoryCache } from "./memory";

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

describe("MemoryCache", () => {
	test("evicts the least recently used entry at capacity", async () => {
		const cache = new MemoryCache({ maxEntries: 2 });
		await cache.set("a", 1);
		await cache.set("b", 2);
		await cache.get("a");
		await cache.set("c", 3);

		expect(await cache.get("a")).toBe(1);
		expect(await cache.get("b")).toBeUndefined();
		expect(await cache.get("c")).toBe(3);
	});

	test("expires and deletes entries", async () => {
		const cache = new MemoryCache();
		await cache.set("expiring", "value", 10);
		await delay(20);
		expect(await cache.get("expiring")).toBeUndefined();

		await cache.set("deleted", "value");
		await cache.del("deleted");
		expect(await cache.get("deleted")).toBeUndefined();
	});
});
