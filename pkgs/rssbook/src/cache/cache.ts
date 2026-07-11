/** Values supported by RSSBook cache implementations. */
export type CacheValue =
	| null
	| string
	| number
	| boolean
	| Date
	| CacheValue[]
	| {
			[key: string]: CacheValue;
	  };

/** Shared options for cache implementations. */
export interface CacheOptions {
	/** Default lifetime in milliseconds. Zero disables automatic expiration. */
	defaultMaxAgeMs?: number;
	/** Prefix prepended to every backend key. */
	prefix?: string;
}

type SerializedValue =
	| null
	| string
	| number
	| boolean
	| SerializedValue[]
	| {
			[key: string]: SerializedValue;
	  };

interface SerializedEntry {
	expiresAt: number | null;
	value: SerializedValue;
}

const DATE_MARKER = "__rssbook_cache_date__";
const DEFAULT_MAX_AGE_MS = 10 * 60 * 1000;

const encode = (value: CacheValue): SerializedValue => {
	if (value instanceof Date) return { [DATE_MARKER]: value.toISOString() };
	if (Array.isArray(value)) return value.map(encode);
	if (value !== null && typeof value === "object") {
		return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encode(item)]));
	}
	return value;
};

const decode = (value: SerializedValue): CacheValue => {
	if (Array.isArray(value)) return value.map(decode);
	if (value !== null && typeof value === "object") {
		const entries = Object.entries(value);
		if (entries.length === 1 && typeof value[DATE_MARKER] === "string") {
			return new Date(value[DATE_MARKER]);
		}
		return Object.fromEntries(entries.map(([key, item]) => [key, decode(item)]));
	}
	return value;
};

const validateMaxAge = (maxAgeMs: number): number => {
	if (!Number.isFinite(maxAgeMs) || maxAgeMs < 0) {
		throw new RangeError("Cache maxAgeMs must be a finite, non-negative number.");
	}
	return maxAgeMs;
};

/**
 * Storage-independent RSSBook cache with serialization, exact TTL handling,
 * request coalescing, and lifecycle management.
 */
export abstract class Cache {
	/** Prefix prepended to every backend key. */
	public readonly prefix: string;

	/** Default lifetime in milliseconds. Zero disables automatic expiration. */
	public readonly defaultMaxAgeMs: number;

	private readonly inFlight = new Map<string, Promise<CacheValue>>();
	private closed = false;
	private deinitializing?: Promise<void>;

	protected constructor(options: CacheOptions = {}) {
		this.prefix = options.prefix ?? "";
		this.defaultMaxAgeMs = validateMaxAge(options.defaultMaxAgeMs ?? DEFAULT_MAX_AGE_MS);
	}

	/** Read a serialized entry from the backend. */
	protected abstract getRaw(key: string): Promise<string | undefined>;

	/** Store a serialized entry using the requested lifetime in milliseconds. */
	protected abstract setRaw(key: string, serializedEntry: string, maxAgeMs: number): Promise<void>;

	/** Delete an entry from the backend. */
	protected abstract deleteRaw(key: string): Promise<void>;

	/** Release resources owned by the backend. */
	protected abstract closeBackend(): Promise<void>;

	private fullKey(key: string): string {
		return `${this.prefix}${key}`;
	}

	private assertOpen(): void {
		if (this.closed) throw new Error("This RSSBook Cache has been deinitialized.");
	}

	/** Get a cached value, or `undefined` when it is missing or expired. */
	public async get<T extends CacheValue = CacheValue>(key: string): Promise<T | undefined> {
		this.assertOpen();
		const fullKey = this.fullKey(key);
		const raw = await this.getRaw(fullKey);
		if (raw === undefined) return undefined;

		const entry: SerializedEntry = JSON.parse(raw);
		if (entry.expiresAt !== null && Date.now() >= entry.expiresAt) {
			void this.deleteRaw(fullKey).catch(() => undefined);
			return undefined;
		}

		return decode(entry.value) as T;
	}

	/** Store a value with an optional lifetime in milliseconds. */
	public async set(
		key: string,
		value: CacheValue,
		maxAgeMs: number = this.defaultMaxAgeMs,
	): Promise<void> {
		this.assertOpen();
		const lifetime = validateMaxAge(maxAgeMs);
		const entry: SerializedEntry = {
			expiresAt: lifetime === 0 ? null : Date.now() + lifetime,
			value: encode(value),
		};
		await this.setRaw(this.fullKey(key), JSON.stringify(entry), lifetime);
	}

	/** Delete a cached value. */
	public async del(key: string): Promise<void> {
		this.assertOpen();
		await this.deleteRaw(this.fullKey(key));
	}

	/**
	 * Get a cached value or run one shared fetcher for concurrent misses of the
	 * same fully-prefixed key.
	 */
	public async tryGet<T extends CacheValue = CacheValue>(
		key: string,
		fetcher: (key: string) => T | Promise<T>,
		maxAgeMs: number = this.defaultMaxAgeMs,
	): Promise<T> {
		this.assertOpen();
		validateMaxAge(maxAgeMs);
		const cached = await this.get<T>(key);
		if (cached !== undefined) return cached;

		const fullKey = this.fullKey(key);
		const existing = this.inFlight.get(fullKey);
		if (existing) return existing as Promise<T>;

		const pending = (async (): Promise<CacheValue> => {
			const fresh = await fetcher(key);
			await this.set(key, fresh, maxAgeMs);
			return fresh;
		})();
		this.inFlight.set(fullKey, pending);

		try {
			return (await pending) as T;
		} finally {
			if (this.inFlight.get(fullKey) === pending) this.inFlight.delete(fullKey);
		}
	}

	/** Release backend resources. Calling this method more than once is safe. */
	public async deinit(): Promise<void> {
		if (this.deinitializing) return this.deinitializing;
		this.closed = true;
		this.deinitializing = this.closeBackend();
		return this.deinitializing;
	}

	/** Release backend resources when used with `await using`. */
	public async [Symbol.asyncDispose](): Promise<void> {
		await this.deinit();
	}
}
