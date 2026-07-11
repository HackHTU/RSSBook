import { Cache, type CacheOptions } from "./cache";

/** Cache backend that intentionally never persists values. */
export class NullCache extends Cache {
	public constructor(options: CacheOptions = {}) {
		super(options);
	}

	protected async getRaw(_key: string): Promise<undefined> {
		return undefined;
	}

	protected async setRaw(
		_key: string,
		_serializedEntry: string,
		_maxAgeMs: number,
	): Promise<void> {}

	protected async deleteRaw(_key: string): Promise<void> {}

	protected async closeBackend(): Promise<void> {}
}
