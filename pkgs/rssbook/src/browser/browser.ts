import type { BrowserContext, Browser as PuppeteerBrowser, Target } from "puppeteer-core";
import type { Awaitable } from "@/types/utils";
import { BrowserClosedError, BrowserInitializationError } from "@/utils/error";
import { logger } from "@/utils/logger";
import { BrowserContextLease, BrowserPageLease } from "./lease";

export interface BrowserConcurrencyOptions {
	/** Maximum number of physical browser processes or remote sessions. */
	maxBrowsers?: number;
	/** Maximum number of isolated contexts managed in each physical browser. */
	maxContextsPerBrowser?: number;
	/** Maximum number of tracked pages, including popups, in each context. */
	maxPagesPerContext?: number;
}

export interface BrowserAcquireOptions {
	/** Cancels an acquisition while it is waiting for pool capacity. */
	signal?: AbortSignal;
}

interface BrowserSlot {
	browser?: PuppeteerBrowser;
	contexts: Set<ContextSlot>;
	contextReservations: number;
	disconnected: boolean;
	opening?: Promise<PuppeteerBrowser>;
}

interface ContextSlot {
	browserSlot: BrowserSlot;
	closing: boolean;
	context: BrowserContext;
	expectedPageTargets: number;
	lease?: BrowserContextLease;
	managedTargets: Set<Target>;
	pageLeases: Set<BrowserPageLease>;
	pageReservations: number;
	unmanagedTargets: Set<Target>;
}

interface CapacityWaiter {
	onAbort?: () => void;
	reject: (reason?: unknown) => void;
	resolve: () => void;
	signal?: AbortSignal;
}

/**
 * App-scoped Puppeteer browser pool.
 *
 * Concrete providers only create and close physical browsers. This base class
 * owns Browser, BrowserContext, and Page concurrency and lifecycle. A route
 * must close every acquired lease; application shutdown only provides a final
 * cleanup boundary.
 *
 * `acquirePage()` creates an isolated context for one page, so its effective
 * concurrency is bounded by both context and page capacity. Use
 * `acquireContext()` when several pages need to share cookies or other context
 * state, then keep concurrent page leases within `maxPagesPerContext`.
 */
export abstract class Browser {
	/** Maximum number of physical browser processes or remote sessions. */
	public readonly maxBrowsers: number;
	/** Maximum number of isolated contexts in one physical browser. */
	public readonly maxContextsPerBrowser: number;
	/** Maximum number of tracked pages, including popups, in one context. */
	public readonly maxPagesPerContext: number;

	private readonly browserSlots: BrowserSlot[] = [];
	private closed = false;
	private deinitializing?: Promise<void>;
	private readonly waiters: CapacityWaiter[] = [];

	/** Configure the fixed capacity limits enforced by this pool. */
	public constructor(options: BrowserConcurrencyOptions) {
		this.maxBrowsers = validateCapacity("maxBrowsers", options.maxBrowsers ?? 1);
		this.maxContextsPerBrowser = validateCapacity(
			"maxContextsPerBrowser",
			options.maxContextsPerBrowser ?? 1,
		);
		this.maxPagesPerContext = validateCapacity(
			"maxPagesPerContext",
			options.maxPagesPerContext ?? 1,
		);
	}

	/**
	 * Create one physical Puppeteer-compatible browser.
	 *
	 * Providers should create a new local process or remote session on every
	 * call. The pool invokes this method lazily as demand reaches new slots.
	 */
	protected abstract createBrowser(): Awaitable<PuppeteerBrowser>;

	/**
	 * Release one physical browser.
	 *
	 * Providers that do not own the remote session may override this method and
	 * disconnect instead of closing it.
	 */
	protected async closeBrowser(browser: PuppeteerBrowser): Promise<void> {
		await browser.close();
	}

	/**
	 * Warm one physical browser slot.
	 *
	 * Calling this method is optional because acquisitions initialize the pool
	 * lazily. It never fills every configured browser slot eagerly.
	 */
	public async init(): Promise<void> {
		this.assertOpen();
		const slot = this.browserSlots.find((candidate) => !candidate.disconnected);
		await this.resolveBrowser(slot ?? this.createBrowserSlot());
	}

	/**
	 * Acquire an isolated BrowserContext lease from the pool.
	 *
	 * Pages acquired from the returned lease share cookies, local storage, and
	 * other context state. Close the lease in `finally`; closing it also closes
	 * its outstanding pages and returns context capacity to the pool.
	 */
	public async acquireContext(options: BrowserAcquireOptions = {}): Promise<BrowserContextLease> {
		for (;;) {
			this.assertOpen();
			options.signal?.throwIfAborted();
			this.pruneClosedContexts();

			const browserSlot = this.reserveBrowserContext();
			if (!browserSlot) {
				await this.waitForCapacity(options.signal);
				continue;
			}

			let context: BrowserContext | undefined;
			try {
				const browser = await this.resolveBrowser(browserSlot);
				this.assertOpen();
				if (browserSlot.disconnected) continue;

				context = await browser.createBrowserContext();
				this.assertOpen();

				const contextSlot: ContextSlot = {
					browserSlot,
					closing: false,
					context,
					expectedPageTargets: 0,
					managedTargets: new Set(),
					pageLeases: new Set(),
					pageReservations: 0,
					unmanagedTargets: new Set(),
				};
				const lease = new BrowserContextLease(
					context,
					(acquireOptions) => this.acquirePageInContext(contextSlot, acquireOptions),
					() => this.closeContext(contextSlot),
				);
				contextSlot.lease = lease;
				browserSlot.contexts.add(contextSlot);
				this.observeContextTargets(contextSlot);
				return lease;
			} catch (error) {
				if (context && !context.closed) await context.close().catch(() => {});
				throw error;
			} finally {
				browserSlot.contextReservations -= 1;
				this.notifyCapacity();
			}
		}
	}

	/**
	 * Acquire one Page in its own isolated BrowserContext.
	 *
	 * Close the returned lease in `finally`. Releasing the page also closes its
	 * private context, which prevents cookies and storage leaking between route
	 * executions.
	 */
	public async acquirePage(options: BrowserAcquireOptions = {}): Promise<BrowserPageLease> {
		const contextLease = await this.acquireContext(options);
		try {
			const pageLease = await contextLease.acquirePage(options);
			return pageLease.closeContextOnRelease(() => contextLease.close());
		} catch (error) {
			await contextLease.close().catch(() => {});
			throw error;
		}
	}

	/**
	 * Reject pending acquisitions and close all contexts and physical browsers.
	 *
	 * Deinitialization is idempotent and does not initialize an unused pool.
	 * RSSBook calls it automatically when the application stops.
	 */
	public async deinit(): Promise<void> {
		if (this.deinitializing) return this.deinitializing;

		this.closed = true;
		this.rejectWaiters(new BrowserClosedError());
		this.deinitializing = (async () => {
			const slots = [...this.browserSlots];
			const contextResults = await Promise.allSettled(
				slots.flatMap((slot) => [...slot.contexts].map((context) => context.lease?.close())),
			);
			const browsers = await Promise.allSettled(slots.map((slot) => this.resolveBrowser(slot)));
			const closeResults = await Promise.allSettled(
				browsers.flatMap((result) =>
					result.status === "fulfilled" ? [this.closePhysicalBrowser(result.value)] : [],
				),
			);

			this.browserSlots.length = 0;
			const failed = [...contextResults, ...closeResults].find(
				(result) => result.status === "rejected",
			);
			if (failed?.status === "rejected") throw failed.reason;
		})();

		return this.deinitializing;
	}

	/** Deinitialize the pool when used with `await using`. */
	public async [Symbol.asyncDispose](): Promise<void> {
		await this.deinit();
	}

	private async acquirePageInContext(
		contextSlot: ContextSlot,
		options: BrowserAcquireOptions,
	): Promise<BrowserPageLease> {
		for (;;) {
			this.assertOpen();
			options.signal?.throwIfAborted();
			if (contextSlot.closing || contextSlot.context.closed) {
				throw new BrowserClosedError();
			}

			if (this.contextPageCount(contextSlot) >= this.maxPagesPerContext) {
				await this.waitForCapacity(options.signal);
				continue;
			}

			contextSlot.pageReservations += 1;
			contextSlot.expectedPageTargets += 1;
			let acquired = false;
			try {
				const page = await contextSlot.context.newPage();
				acquired = true;
				const target = page.target();
				contextSlot.managedTargets.add(target);
				if (contextSlot.expectedPageTargets > 0) contextSlot.expectedPageTargets -= 1;

				let lease: BrowserPageLease;
				lease = new BrowserPageLease(page, contextSlot.context, () => {
					contextSlot.pageLeases.delete(lease);
					contextSlot.managedTargets.delete(target);
					this.notifyCapacity();
				});
				contextSlot.pageLeases.add(lease);
				page.once("close", () => void lease.release());
				return lease;
			} finally {
				if (!acquired && contextSlot.expectedPageTargets > 0) {
					contextSlot.expectedPageTargets -= 1;
				}
				contextSlot.pageReservations -= 1;
				this.notifyCapacity();
			}
		}
	}

	private async closeContext(contextSlot: ContextSlot): Promise<void> {
		if (contextSlot.closing) return;
		contextSlot.closing = true;

		try {
			await Promise.allSettled([...contextSlot.pageLeases].map((lease) => lease.close()));
			if (!contextSlot.context.closed) await contextSlot.context.close();
		} finally {
			contextSlot.browserSlot.contexts.delete(contextSlot);
			contextSlot.pageLeases.clear();
			contextSlot.managedTargets.clear();
			contextSlot.unmanagedTargets.clear();
			this.notifyCapacity();
		}
	}

	private closePhysicalBrowser(browser: PuppeteerBrowser): Promise<void> {
		logger.info("[Browser] Deinitializing Puppeteer browser.");
		return Promise.resolve(this.closeBrowser(browser));
	}

	private contextPageCount(contextSlot: ContextSlot): number {
		return (
			contextSlot.pageLeases.size + contextSlot.pageReservations + contextSlot.unmanagedTargets.size
		);
	}

	private createBrowserSlot(): BrowserSlot {
		const slot: BrowserSlot = {
			contextReservations: 0,
			contexts: new Set(),
			disconnected: false,
		};
		this.browserSlots.push(slot);
		return slot;
	}

	private async openBrowser(slot: BrowserSlot): Promise<PuppeteerBrowser> {
		logger.info("[Browser] Initializing Puppeteer browser.");
		try {
			const browser = await this.createBrowser();
			if (!isPuppeteerBrowser(browser)) {
				throw new BrowserInitializationError(
					"Browser provider must create a Puppeteer-compatible Browser.",
				);
			}

			slot.browser = browser;
			browser.once("disconnected", () => this.handleBrowserDisconnected(slot));
			logger.info("[Browser] Puppeteer browser is ready.");
			return browser;
		} catch (error) {
			this.removeBrowserSlot(slot);
			throw error;
		} finally {
			slot.opening = undefined;
			this.notifyCapacity();
		}
	}

	private handleBrowserDisconnected(slot: BrowserSlot): void {
		slot.disconnected = true;
		this.removeBrowserSlot(slot);
		for (const context of slot.contexts) void context.lease?.close().catch(() => {});
		this.notifyCapacity();
	}

	private notifyCapacity(): void {
		for (const waiter of this.waiters.splice(0)) {
			if (waiter.onAbort && waiter.signal) {
				waiter.signal.removeEventListener("abort", waiter.onAbort);
			}
			waiter.resolve();
		}
	}

	private observeContextTargets(contextSlot: ContextSlot): void {
		contextSlot.context.on("targetcreated", (target) => {
			if (target.type() !== "page") return;
			if (contextSlot.expectedPageTargets > 0) {
				contextSlot.expectedPageTargets -= 1;
				contextSlot.managedTargets.add(target);
				return;
			}

			contextSlot.unmanagedTargets.add(target);
			if (this.contextPageCount(contextSlot) > this.maxPagesPerContext) {
				void target
					.page()
					.then((page) => page?.close())
					.catch(() => {});
			}
		});
		contextSlot.context.on("targetdestroyed", (target) => {
			if (contextSlot.unmanagedTargets.delete(target)) this.notifyCapacity();
		});
	}

	private pruneClosedContexts(): void {
		for (const slot of this.browserSlots) {
			for (const context of slot.contexts) {
				if (context.context.closed) void context.lease?.close().catch(() => {});
			}
		}
	}

	private rejectWaiters(reason: unknown): void {
		for (const waiter of this.waiters.splice(0)) {
			if (waiter.onAbort && waiter.signal) {
				waiter.signal.removeEventListener("abort", waiter.onAbort);
			}
			waiter.reject(reason);
		}
	}

	private removeBrowserSlot(slot: BrowserSlot): void {
		const index = this.browserSlots.indexOf(slot);
		if (index >= 0) this.browserSlots.splice(index, 1);
	}

	private reserveBrowserContext(): BrowserSlot | undefined {
		let slot = this.browserSlots
			.filter(
				(candidate) =>
					!candidate.disconnected &&
					candidate.contexts.size + candidate.contextReservations < this.maxContextsPerBrowser,
			)
			.sort(
				(left, right) =>
					left.contexts.size +
					left.contextReservations -
					(right.contexts.size + right.contextReservations),
			)[0];

		if (!slot && this.browserSlots.length < this.maxBrowsers) {
			slot = this.createBrowserSlot();
		}
		if (slot) slot.contextReservations += 1;
		return slot;
	}

	private async resolveBrowser(slot: BrowserSlot): Promise<PuppeteerBrowser> {
		if (slot.browser) return slot.browser;
		if (!slot.opening) slot.opening = this.openBrowser(slot);
		return slot.opening;
	}

	private waitForCapacity(signal?: AbortSignal): Promise<void> {
		signal?.throwIfAborted();
		return new Promise((resolve, reject) => {
			const waiter: CapacityWaiter = { reject, resolve, signal };
			if (signal) {
				waiter.onAbort = () => {
					const index = this.waiters.indexOf(waiter);
					if (index >= 0) this.waiters.splice(index, 1);
					reject(signal.reason);
				};
				signal.addEventListener("abort", waiter.onAbort, { once: true });
			}
			this.waiters.push(waiter);
		});
	}

	private assertOpen(): void {
		if (this.closed) throw new BrowserClosedError();
	}
}

function isPuppeteerBrowser(value: unknown): value is PuppeteerBrowser {
	if (typeof value !== "object" || value === null) return false;

	return (
		typeof Reflect.get(value, "close") === "function" &&
		typeof Reflect.get(value, "createBrowserContext") === "function" &&
		typeof Reflect.get(value, "newPage") === "function" &&
		typeof Reflect.get(value, "once") === "function"
	);
}

function validateCapacity(name: string, value: number): number {
	if (!Number.isInteger(value) || value < 1) {
		throw new RangeError(`${name} must be a positive integer.`);
	}
	return value;
}
