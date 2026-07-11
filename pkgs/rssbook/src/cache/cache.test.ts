import { describe, expect, test } from "bun:test";
import { Cache, type CacheValue } from "./cache";

class TestCache extends Cache {
	public readonly values = new Map<string, string>();
	public readonly deleted: string[] = [];
	public closeCount = 0;

	// biome-ignore lint/complexity/noUselessConstructor: exposes the protected base constructor for tests
	public constructor(options?: import("./cache").CacheOptions) {
		super(options);
	}

	protected async getRaw(key: string): Promise<string | undefined> {
		return this.values.get(key);
	}

	protected async setRaw(key: string, value: string, _maxAgeMs: number): Promise<void> {
		this.values.set(key, value);
	}

	protected async deleteRaw(key: string): Promise<void> {
		this.deleted.push(key);
		this.values.delete(key);
	}

	protected async closeBackend(): Promise<void> {
		this.closeCount += 1;
	}
}

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

describe("Cache", () => {
	test("prefixes keys and restores recursive values including Date and null", async () => {
		const cache = new TestCache({ prefix: "test:" });
		const date = new Date("2026-01-02T03:04:05.000Z");
		const value = { date, nested: [{ date }, null] } satisfies CacheValue;

		await cache.set("key", value);

		expect(cache.values.has("test:key")).toBe(true);
		expect(await cache.get("key")).toEqual(value);
	});

	test("uses undefined exclusively for cache misses", async () => {
		const cache = new TestCache();
		await cache.set("null", null);

		expect(await cache.get("missing")).toBeUndefined();
		expect(await cache.get("null")).toBeNull();
	});

	test("enforces exact TTL and asynchronously deletes expired entries", async () => {
		const cache = new TestCache();
		await cache.set("short", "value", 10);
		expect(await cache.get("short")).toBe("value");

		await delay(20);
		expect(await cache.get("short")).toBeUndefined();
		await delay(0);
		expect(cache.deleted).toContain("short");
	});

	test("keeps zero-TTL entries and rejects invalid TTL values", async () => {
		const cache = new TestCache({ defaultMaxAgeMs: 0 });
		await cache.set("forever", "value", 0);
		await delay(5);
		expect(await cache.get("forever")).toBe("value");

		for (const invalid of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
			await expect(cache.set("invalid", "value", invalid)).rejects.toBeInstanceOf(RangeError);
			await expect(cache.tryGet("invalid", () => "value", invalid)).rejects.toBeInstanceOf(
				RangeError,
			);
		}
		expect(() => new TestCache({ defaultMaxAgeMs: -1 })).toThrow(RangeError);
	});

	test("coalesces concurrent misses for the same key", async () => {
		const cache = new TestCache();
		let calls = 0;
		const fetcher = async () => {
			calls += 1;
			await delay(10);
			return "fresh";
		};

		expect(await Promise.all([cache.tryGet("key", fetcher), cache.tryGet("key", fetcher)])).toEqual(
			["fresh", "fresh"],
		);
		expect(calls).toBe(1);
	});

	test("does not block fetchers for different keys", async () => {
		const cache = new TestCache();
		const started: string[] = [];
		let release: (() => void) | undefined;
		const gate = new Promise<void>((resolve) => {
			release = resolve;
		});
		const fetcher = async (key: string) => {
			started.push(key);
			await gate;
			return key;
		};

		const pending = Promise.all([cache.tryGet("a", fetcher), cache.tryGet("b", fetcher)]);
		await delay(0);
		expect(started).toEqual(["a", "b"]);
		release?.();
		expect(await pending).toEqual(["a", "b"]);
	});

	test("shares fetch errors and allows a later retry", async () => {
		const cache = new TestCache();
		const error = new Error("failed");
		let calls = 0;
		const failing = async () => {
			calls += 1;
			await delay(5);
			throw error;
		};

		const results = await Promise.allSettled([
			cache.tryGet("key", failing),
			cache.tryGet("key", failing),
		]);
		expect(results).toEqual([
			{ reason: error, status: "rejected" },
			{ reason: error, status: "rejected" },
		]);
		expect(calls).toBe(1);
		expect(await cache.tryGet("key", () => "recovered")).toBe("recovered");
	});

	test("deinitializes once and rejects operations after closing", async () => {
		const cache = new TestCache();
		await Promise.all([cache.deinit(), cache.deinit(), cache[Symbol.asyncDispose]()]);
		expect(cache.closeCount).toBe(1);

		await expect(cache.get("key")).rejects.toThrow("deinitialized");
		await expect(cache.set("key", "value")).rejects.toThrow("deinitialized");
		await expect(cache.del("key")).rejects.toThrow("deinitialized");
		await expect(cache.tryGet("key", () => "value")).rejects.toThrow("deinitialized");
	});
});
