import { Cache, type CacheOptions } from "rssbook";

/** Minimal Workers KV surface required by the RSSBook cache adapter. */
export interface CloudflareKVNamespace {
	delete(key: string): Promise<void>;
	get(key: string): Promise<string | null>;
	put(key: string, value: string, options?: { expirationTtl: number }): Promise<void>;
}

/** RSSBook cache backed directly by a Cloudflare Workers KV binding. */
export class CloudflareKVCache extends Cache {
	public constructor(
		private readonly namespace: CloudflareKVNamespace,
		options: CacheOptions = {},
	) {
		super(options);
	}

	protected async getRaw(key: string): Promise<string | undefined> {
		return (await this.namespace.get(key)) ?? undefined;
	}

	protected async setRaw(key: string, serializedEntry: string, maxAgeMs: number): Promise<void> {
		if (maxAgeMs === 0) {
			await this.namespace.put(key, serializedEntry);
			return;
		}

		await this.namespace.put(key, serializedEntry, {
			expirationTtl: Math.max(60, Math.ceil(maxAgeMs / 1000)),
		});
	}

	protected async deleteRaw(key: string): Promise<void> {
		await this.namespace.delete(key);
	}

	protected async closeBackend(): Promise<void> {}
}
