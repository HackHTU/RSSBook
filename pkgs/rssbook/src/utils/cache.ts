import { createStorage, type Storage } from "unstorage";
import lruCacheDriver from "unstorage/drivers/lru-cache";
import { CacheMissError } from "@/utils/error";

/**
 * Primitive types that can be stored directly
 */
type StoragePrimitive = null | string | number | boolean | Date;

/**
 * Values that can be safely stored and serialized
 */
type StorageValue = StoragePrimitive | { [key: string]: StorageValue } | StorageValue[];

/**
 * Configuration options for Cache instance
 */
type CacheOptions = {
	/** Key prefix for all cache operations */
	prefix: string;
	/** Default TTL in milliseconds for cached items */
	defaultMaxAgeMs: number;
};

/**
 * Cache metadata with TTL information
 */
interface CacheEntry<T = unknown> {
	/** The cached value */
	value: T;
	/** Timestamp when the item was cached (Unix timestamp) */
	timestamp: number;
	/** TTL in milliseconds */
	ttl?: number;
}

/**
 * Special marker for serialized Date objects
 */
const DATE_MARKER = "__date__";

/**
 * Serializes a value, converting Date objects to a special format
 */
function serialize<T>(value: T): T {
	if (value instanceof Date) {
		return { [DATE_MARKER]: value.toISOString() } as T;
	}
	if (Array.isArray(value)) {
		return value.map(serialize) as T;
	}
	if (value !== null && typeof value === "object") {
		const result: Record<string, unknown> = {};
		for (const [key, val] of Object.entries(value)) {
			result[key] = serialize(val);
		}
		return result as T;
	}
	return value;
}

/**
 * Deserializes a value, restoring Date objects from the special format
 */
function deserialize<T>(value: T): T {
	if (value !== null && typeof value === "object") {
		// Check if it's a serialized Date
		if (
			DATE_MARKER in value &&
			typeof (value as Record<string, unknown>)[DATE_MARKER] === "string"
		) {
			return new Date((value as Record<string, string>)[DATE_MARKER]) as T;
		}
		// Handle arrays
		if (Array.isArray(value)) {
			return value.map(deserialize) as T;
		}
		// Handle objects
		const result: Record<string, unknown> = {};
		for (const [key, val] of Object.entries(value)) {
			result[key] = deserialize(val);
		}
		return result as T;
	}
	return value;
}

/**
 * A high-performance cache wrapper around unstorage with TTL support.
 * Optimizes storage operations by minimizing get/set calls.
 */
export class Cache {
	private storage: Storage;
	private option: CacheOptions;

	constructor(
		storage: Storage = createStorage({
			driver: lruCacheDriver({
				ttl: 10 * 60 * 1000,
			}),
		}),
		options: CacheOptions = {
			defaultMaxAgeMs: 10 * 60 * 1000,
			prefix: "",
		},
	) {
		this.storage = storage;
		this.option = options;
	}

	private key(key: string): string {
		return `${this.option.prefix}${key}`;
	}

	private isExpired(entry: CacheEntry): boolean {
		if (!entry.ttl) return false;

		return Date.now() - entry.timestamp > entry.ttl;
	}

	async get<T>(key: string): Promise<T | null> {
		const k = this.key(key);
		const entry = await this.storage.getItem<CacheEntry<T>>(k);

		if (!entry) return null;

		if (this.isExpired(entry)) {
			this.storage.removeItem(k).catch(() => {});
			return null;
		}

		// Deserialize the value to restore Date objects
		return deserialize(entry.value);
	}

	async set(
		key: string,
		value: StorageValue,
		maxAgeMs: number = this.option.defaultMaxAgeMs,
	): Promise<void> {
		const k = this.key(key);

		// Serialize the value to handle Date objects
		const entry: CacheEntry<StorageValue> = {
			timestamp: Date.now(),
			ttl: maxAgeMs,
			value: serialize(value),
		};

		await this.storage.setItem(k, entry, {
			// set for automatic expiration in the underlying storage
			ttl: maxAgeMs,
		});
	}

	async del(key: string): Promise<void> {
		const k = this.key(key);
		await this.storage.removeItem(k);
	}

	/**
	 * Gets a value from cache or fetches it using the provided function.
	 * Optimized to minimize storage operations by combining value and metadata in a single entry.
	 * @param key - The cache key
	 * @param fetcher - Function to fetch the value if not cached or expired
	 * @param maxAgeMs - TTL in milliseconds (overrides default)
	 * @returns The cached or freshly fetched value
	 * @throws Error if cache miss occurs and no fetcher is provided
	 */
	async tryGet<T extends StorageValue = StorageValue>(
		key: string,
		fetcher: (key: string) => T | Promise<T>,
		maxAgeMs: number = this.option.defaultMaxAgeMs,
	): Promise<T> {
		const data = await this.get<T>(key);
		if (data !== null) {
			return data;
		}

		if (!fetcher) {
			throw new CacheMissError(key);
		}

		const fresh = await fetcher(key);
		await this.set(key, fresh, maxAgeMs);
		return fresh;
	}
}
export default Cache;
