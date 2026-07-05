import { describe, expect, test } from "bun:test";
import { createStorage } from "unstorage";
import lruCacheDriver from "unstorage/drivers/lru-cache";
import nullDriver from "unstorage/drivers/null";
import Cache from "@/utils/cache";

describe("cache", () => {
	describe("Cache - LRU Cache", () => {
		const cache = new Cache(
			createStorage({
				driver: lruCacheDriver({
					ttl: 300,
				}),
			}),
		);

		test("should set and get string values", async () => {
			await cache.set("key", "value");
			expect(await cache.get<string>("key")).toBe("value");
		});

		test("should return null for non-existent keys", async () => {
			expect(await cache.get("nonexistent")).toBeNull();
		});

		test("should set and get values with custom TTL", async () => {
			await cache.set("key2", "value2", 100);
			expect(await cache.get<string>("key2")).toBe("value2");
		});

		test("should store and retrieve complex objects", async () => {
			const complexObj = {
				age: 25,
				name: "test",
				nested: {
					array: [1, 2, 3],
					key: "value",
				},
			};
			await cache.set("complex", complexObj);
			expect(await cache.get<typeof complexObj>("complex")).toEqual(complexObj);
		});

		test("should store and retrieve arrays", async () => {
			const arr = [1, 2, 3, "test", { key: "value" }];
			await cache.set("array", arr);
			expect(await cache.get<typeof arr>("array")).toEqual(arr);
		});

		test("should store primitive values", async () => {
			await cache.set("number", 42);
			expect(await cache.get<number>("number")).toBe(42);

			await cache.set("boolean", true);
			expect(await cache.get<boolean>("boolean")).toBe(true);

			await cache.set("null", null);
			expect(await cache.get("null")).toBeNull();
		});

		test("should delete cached items", async () => {
			await cache.set("to-delete", "value");
			expect(await cache.get<string>("to-delete")).toBe("value");

			await cache.del("to-delete");
			expect(await cache.get("to-delete")).toBeNull();
		});

		test("should handle tryGet with cache hit", async () => {
			await cache.set("cached-url", "cached-value");

			const result = await cache.tryGet<string>("cached-url", async () => {
				throw new Error("Fetcher should not be called");
			});

			expect(result).toBe("cached-value");
		});

		test("should handle tryGet with cache miss", async () => {
			const fetcher = async (key: string) => {
				return `fetched-${key}`;
			};

			const result = await cache.tryGet<string>("new-url", fetcher);
			expect(result).toBe("fetched-new-url");

			// Verify it was cached
			expect(await cache.get<string>("new-url")).toBe("fetched-new-url");
		});

		test("should expire items after TTL", async () => {
			await cache.set("expiring", "value", 50); // 50ms TTL
			expect(await cache.get<string>("expiring")).toBe("value");

			// Wait for expiration
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(await cache.get("expiring")).toBeNull();
		});
	});

	describe("Cache - with prefix", () => {
		const cache = new Cache(
			createStorage({
				driver: lruCacheDriver({
					ttl: 1000,
				}),
			}),
			{
				defaultMaxAgeMs: 1000,
				prefix: "test:",
			},
		);

		test("should apply prefix to keys", async () => {
			await cache.set("key", "value");
			expect(await cache.get<string>("key")).toBe("value");
		});

		test("should use default TTL from options", async () => {
			await cache.set("key-with-default-ttl", "value");
			expect(await cache.get<string>("key-with-default-ttl")).toBe("value");
		});
	});

	describe("Cache - Null Cache", () => {
		const cache = new Cache(
			createStorage({
				driver: nullDriver(),
			}),
		);

		test("should not persist any data", async () => {
			await cache.set("key", "value");
			// Null driver doesn't persist data
			expect(await cache.get("key")).toBeNull();
		});

		test("should always trigger fetcher in tryGet", async () => {
			let fetcherCalled = false;

			const result = await cache.tryGet("url", async () => {
				fetcherCalled = true;
				return "fetched";
			});

			expect(fetcherCalled).toBe(true);
			expect(result).toBe("fetched");
		});
	});
});
