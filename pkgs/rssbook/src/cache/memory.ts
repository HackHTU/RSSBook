import { LRUCache } from "lru-cache";
import { Cache, type CacheOptions } from "./cache";

/** Options for the in-process LRU cache. */
export interface MemoryCacheOptions extends CacheOptions {
	/** Maximum number of cached entries. */
	maxEntries?: number;
}

/** In-process LRU cache used by RSSBook by default. */
export class MemoryCache extends Cache {
	private readonly storage: LRUCache<string, string>;

	public constructor(options: MemoryCacheOptions = {}) {
		super(options);
		this.storage = new LRUCache({ max: options.maxEntries ?? 1000 });
	}

	protected async getRaw(key: string): Promise<string | undefined> {
		return this.storage.get(key);
	}

	protected async setRaw(key: string, serializedEntry: string, maxAgeMs: number): Promise<void> {
		this.storage.set(key, serializedEntry, maxAgeMs === 0 ? undefined : { ttl: maxAgeMs });
	}

	protected async deleteRaw(key: string): Promise<void> {
		this.storage.delete(key);
	}

	protected async closeBackend(): Promise<void> {
		this.storage.clear();
	}
}
