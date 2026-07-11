import { describe, expect, test } from "bun:test";
import { type DenoKV, DenoKVCache } from "./cache.ts";

class FakeDenoKV implements DenoKV {
	public readonly values = new Map<string, string>();
	public readonly sets: { key: readonly string[]; options?: { expireIn: number } }[] = [];
	public closed = false;

	public async get(key: readonly ["rssbook", string]): Promise<{ value: unknown }> {
		return { value: this.values.get(JSON.stringify(key)) ?? null };
	}

	public async set(
		key: readonly ["rssbook", string],
		value: string,
		options?: { expireIn: number },
	): Promise<void> {
		this.sets.push({ key, options });
		this.values.set(JSON.stringify(key), value);
	}

	public async delete(key: readonly ["rssbook", string]): Promise<void> {
		this.values.delete(JSON.stringify(key));
	}

	public close(): void {
		this.closed = true;
	}
}

describe("DenoKVCache", () => {
	test("uses the stable prefix key and millisecond expireIn", async () => {
		const kv = new FakeDenoKV();
		const cache = new DenoKVCache(async () => kv, { prefix: "tenant:" });
		await cache.set("key", { value: "json" }, 1234);

		expect(kv.sets[0]).toEqual({
			key: ["rssbook", "tenant:key"],
			options: { expireIn: 1234 },
		});
		expect(await cache.get("key")).toEqual({ value: "json" });
	});

	test("deletes values and closes the KV connection", async () => {
		const kv = new FakeDenoKV();
		const cache = new DenoKVCache(async () => kv);
		await cache.set("key", "value", 0);
		expect(kv.sets[0]?.options).toBeUndefined();
		await cache.del("key");
		expect(await cache.get("key")).toBeUndefined();
		await cache.deinit();
		expect(kv.closed).toBe(true);
	});
});
