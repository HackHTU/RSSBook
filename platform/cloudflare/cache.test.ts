import { describe, expect, test } from "bun:test";
import { CloudflareKVCache, type CloudflareKVNamespace } from "./cache";

class FakeNamespace implements CloudflareKVNamespace {
	public readonly values = new Map<string, string>();
	public readonly puts: { key: string; options?: { expirationTtl: number }; value: string }[] = [];

	public async get(key: string): Promise<string | null> {
		return this.values.get(key) ?? null;
	}

	public async put(key: string, value: string, options?: { expirationTtl: number }): Promise<void> {
		this.puts.push({ key, options, value });
		this.values.set(key, value);
	}

	public async delete(key: string): Promise<void> {
		this.values.delete(key);
	}
}

describe("CloudflareKVCache", () => {
	test("stores JSON-compatible data and deletes entries", async () => {
		const namespace = new FakeNamespace();
		const cache = new CloudflareKVCache(namespace, { prefix: "prefix:" });
		const value = { nested: [1, null, "value"] };

		await cache.set("key", value);
		expect(await cache.get("key")).toEqual(value);
		expect(namespace.puts[0]?.key).toBe("prefix:key");
		await cache.del("key");
		expect(await cache.get("key")).toBeUndefined();
	});

	test("rounds milliseconds up to seconds and enforces the 60-second minimum", async () => {
		const namespace = new FakeNamespace();
		const cache = new CloudflareKVCache(namespace);

		await cache.set("short", "value", 1);
		await cache.set("long", "value", 60_001);
		expect(namespace.puts[0]?.options).toEqual({ expirationTtl: 60 });
		expect(namespace.puts[1]?.options).toEqual({ expirationTtl: 61 });
	});

	test("omits backend expiration for zero TTL", async () => {
		const namespace = new FakeNamespace();
		const cache = new CloudflareKVCache(namespace);
		await cache.set("key", "value", 0);
		expect(namespace.puts[0]?.options).toBeUndefined();
	});
});
