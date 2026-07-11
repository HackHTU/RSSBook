import type { BrowserContext, Page } from "puppeteer-core";
import type { BrowserAcquireOptions } from "./browser";

type AcquirePage = (options: BrowserAcquireOptions) => Promise<BrowserPageLease>;
type Release = () => void | Promise<void>;

/** A concurrency-tracked Puppeteer Page. */
export class BrowserPageLease {
	private closePromise?: Promise<void>;
	private releaseContext?: Release;
	private releaseContextPromise?: Promise<void>;
	private releasePromise?: Promise<void>;
	private released = false;

	public constructor(
		public readonly page: Page,
		public readonly context: BrowserContext,
		private readonly onRelease: Release,
	) {}

	/** Close the owning Context when this Page is released. */
	public closeContextOnRelease(release: Release): this {
		this.releaseContext = release;
		if (this.released) void this.releaseOwnedContext();
		return this;
	}

	public close(): Promise<void> {
		if (this.closePromise) return this.closePromise;
		this.closePromise = (async () => {
			try {
				if (!this.page.isClosed()) await this.page.close();
			} finally {
				await this.release();
			}
		})();
		return this.closePromise;
	}

	/** Release capacity when Puppeteer closes the page externally. */
	public release(): Promise<void> {
		if (this.releasePromise) return this.releasePromise;
		this.released = true;
		this.releasePromise = (async () => {
			await this.onRelease();
			await this.releaseOwnedContext();
		})();
		return this.releasePromise;
	}

	public async [Symbol.asyncDispose](): Promise<void> {
		await this.close();
	}

	private releaseOwnedContext(): Promise<void> {
		if (!this.releaseContext) return Promise.resolve();
		this.releaseContextPromise ??= Promise.resolve(this.releaseContext());
		return this.releaseContextPromise;
	}
}

/** A concurrency-tracked isolated Puppeteer BrowserContext. */
export class BrowserContextLease {
	private closePromise?: Promise<void>;

	public constructor(
		public readonly context: BrowserContext,
		private readonly acquire: AcquirePage,
		private readonly release: Release,
	) {}

	public async acquirePage(options: BrowserAcquireOptions = {}): Promise<BrowserPageLease> {
		if (this.closePromise) throw new Error("BrowserContextLease is closed.");
		return this.acquire(options);
	}

	public close(): Promise<void> {
		if (!this.closePromise) this.closePromise = Promise.resolve(this.release());
		return this.closePromise;
	}

	public async [Symbol.asyncDispose](): Promise<void> {
		await this.close();
	}
}
