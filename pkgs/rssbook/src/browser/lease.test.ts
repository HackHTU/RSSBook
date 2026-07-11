import { describe, expect, mock, test } from "bun:test";
import { BrowserContextLease, BrowserPageLease } from "./lease";
import { createFakeContext, createFakePage } from "./test-helpers";

describe("Browser leases", () => {
	test("BrowserPageLease releases once when closed repeatedly", async () => {
		const page = createFakePage();
		const context = createFakeContext();
		const release = mock(async () => {});
		const lease = new BrowserPageLease(page, context, release);
		await Promise.all([lease.close(), lease.close()]);
		expect(page.close).toHaveBeenCalledTimes(1);
		expect(release).toHaveBeenCalledTimes(1);
	});

	test("private Page release closes its owning Context", async () => {
		const page = createFakePage();
		const context = createFakeContext();
		const pageLease = new BrowserPageLease(page, context, () => {});
		const contextLease = new BrowserContextLease(
			context,
			async () => pageLease,
			() => context.close(),
		);
		const privatePage = (await contextLease.acquirePage()).closeContextOnRelease(() =>
			contextLease.close(),
		);
		await privatePage.close();
		expect(context.close).toHaveBeenCalledTimes(1);
	});

	test("BrowserContextLease closes idempotently", async () => {
		const context = createFakeContext();
		const release = mock(async () => {});
		const lease = new BrowserContextLease(
			context,
			async () => {
				throw new Error("not used");
			},
			release,
		);
		await Promise.all([lease.close(), lease.close()]);
		expect(release).toHaveBeenCalledTimes(1);
	});
});
