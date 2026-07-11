import { Cache, type CacheOptions } from "rssbook";

type DenoKVKey = readonly ["rssbook", string];

/** Minimal Deno KV surface required by the RSSBook cache adapter. */
export interface DenoKV {
	close(): void;
	delete(key: DenoKVKey): Promise<unknown>;
	get(key: DenoKVKey): Promise<{ value: unknown }>;
	set(key: DenoKVKey, value: string, options?: { expireIn: number }): Promise<unknown>;
}

/** RSSBook cache backed directly by Deno KV. */
export class DenoKVCache extends Cache {
	private readonly kv: Promise<DenoKV>;

	public constructor(openKv: () => Promise<DenoKV>, options: CacheOptions = {}) {
		super(options);
		this.kv = openKv();
	}

	private key(key: string): DenoKVKey {
		return ["rssbook", key];
	}

	protected async getRaw(key: string): Promise<string | undefined> {
		const entry = await (await this.kv).get(this.key(key));
		return typeof entry.value === "string" ? entry.value : undefined;
	}

	protected async setRaw(key: string, serializedEntry: string, maxAgeMs: number): Promise<void> {
		const kv = await this.kv;
		if (maxAgeMs === 0) {
			await kv.set(this.key(key), serializedEntry);
			return;
		}
		await kv.set(this.key(key), serializedEntry, { expireIn: maxAgeMs });
	}

	protected async deleteRaw(key: string): Promise<void> {
		await (await this.kv).delete(this.key(key));
	}

	protected async closeBackend(): Promise<void> {
		(await this.kv).close();
	}
}
