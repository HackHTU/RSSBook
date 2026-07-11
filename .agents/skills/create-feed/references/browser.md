# Browser Routes

Use the browser only when the upstream page requires JavaScript, browser cookies, or an API response that cannot be reproduced reliably with `ofetch`. Prefer `ofetch` and `load` for static pages.

RSSBook exposes an app-scoped `Browser` pool backed by Puppeteer-compatible APIs. A route receives `browser` after its Feed metadata declares `browser: true`.

```typescript
export default new Source({
	description: "Rendered feed example.",
	domain: "example.com",
	slug: "rendered-example",
	title: "Rendered Example",
}).feed(
	{
		browser: true,
		description: "Fetch content rendered by the browser.",
		title: "Rendered Example",
	},
	(app) => app.get("/latest", async ({ browser }) => {
		// Browser route implementation
	}),
);
```

## Single Page Lifecycle

Use `browser.acquirePage()` for a single isolated page. It consumes one context and one page slot. Always close the lease in `finally`; closing the page lease also closes its private context.

```typescript
const lease = await browser.acquirePage();

try {
	const { page } = lease;
	await page.goto(link, { waitUntil: "domcontentloaded" });
	return await page.content();
} finally {
	await lease.close();
}
```

RSSBook calls `browser.deinit()` when the application stops. That shutdown hook is a final cleanup boundary, not a replacement for closing route-owned leases.

## Concurrency Model

The Browser instance has three fixed capacity properties:

- `maxBrowsers`: maximum physical local browser processes or remote browser sessions.
- `maxContextsPerBrowser`: maximum isolated contexts in each physical browser.
- `maxPagesPerContext`: maximum tracked pages, including popups, in each context.

When capacity is full, `acquireContext()` and `acquirePage()` wait until another lease releases capacity. Pass an `AbortSignal` when the wait must follow a request timeout or cancellation.

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(new Error("Browser acquisition timed out")), 15_000);

try {
	const lease = await browser.acquirePage({ signal: controller.signal });
	try {
		await lease.page.goto(link, { waitUntil: "domcontentloaded" });
	} finally {
		await lease.close();
	}
} finally {
	clearTimeout(timeout);
}
```

`browser.acquirePage()` creates a private context for every page. Therefore its maximum concurrent page count is constrained by context capacity. Use it for isolated tasks and unrelated requests.

Use `browser.acquireContext()` when pages need to share cookies, local storage, or login state. Pages within one context may run concurrently, but the route must bound workers to `browser.maxPagesPerContext`.

```typescript
const contextLease = await browser.acquireContext();

try {
	const results = new Array<string>(links.length);
	const concurrency = Math.min(links.length, browser.maxPagesPerContext);

	await Promise.all(
		Array.from({ length: concurrency }, async (_, workerIndex) => {
			for (let index = workerIndex; index < links.length; index += concurrency) {
				const pageLease = await contextLease.acquirePage();
				try {
					await pageLease.page.goto(links[index], { waitUntil: "domcontentloaded" });
					results[index] = await pageLease.page.content();
				} finally {
					await pageLease.close();
				}
			}
		}),
	);

	return results;
} finally {
	await contextLease.close();
}
```

Do not acquire an unbounded list of page leases with `Promise.all` and hold every acquired page until all acquisitions finish. If the list exceeds `maxPagesPerContext`, the remaining acquisitions wait while completed acquisitions retain the capacity they need, causing a deadlock. Use bounded workers and close each page before acquiring the next one.

## Browser Utilities

Browser utilities are exported from `@/utils`. They operate on Puppeteer `Page` or `BrowserContext` objects and remain separate from the Browser pool.

### Block Resources

Images, media, and fonts are blocked by default when no resource types are supplied.

```typescript
import { blockResources } from "@/utils";

await blockResources(page);
await page.goto(link, { waitUntil: "domcontentloaded" });
```

Use `allowResources(page, { resourceTypes: [...] })` when only a small set should load. Configure interception before navigation.

### Wait For A Response

`waitForResponse()` registers the response listener before navigation or interaction, avoiding a race with fast responses.

```typescript
import { waitForResponse } from "@/utils";

const response = await waitForResponse(
	page,
	(response) => response.url().includes("/api/items") && response.status() === 200,
	() => page.goto(link, { waitUntil: "domcontentloaded" }),
	{ timeout: 15_000 },
);
const data = await response.json();
```

### Preserve Cookies

Cookies belong to a BrowserContext. Reuse the same context for pages that must share a session. Routes control persistence themselves; RSSBook does not provide a global browser state store.

```typescript
import { getCookieHeader, setCookieHeader } from "@/utils";

await setCookieHeader(contextLease.context, configuredCookie, "https://example.com");
const cookieHeader = await getCookieHeader(contextLease.context);
```

Store a returned Cookie header with the route's chosen cache or configuration mechanism only when that behavior is required. Do not share unrelated users' authenticated state.

### Keep Fingerprints Consistent

Use native Puppeteer methods together with RSSBook helpers before the first navigation. Treat the values as one coherent device profile; do not randomize fields independently or change only the User-Agent.

```typescript
import {
	setColorDepth,
	setDeviceMemory,
	setHardwareConcurrency,
	setLanguages,
} from "@/utils";

await page.setUserAgent({
	platform: "Win32",
	userAgent:
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
});
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.emulateTimezone("America/New_York");
await setLanguages(page, ["en-US", "en"]);
await setHardwareConcurrency(page, 8);
await setDeviceMemory(page, 8);
await setColorDepth(page, 24);
```

The User-Agent, platform, languages, timezone, screen size, hardware concurrency, device memory, and color depth must describe a plausible single machine. Puppeteer and the browser already provide `navigator.vendor`, plugins, permissions, and Chrome APIs; overriding them independently is likely to make the fingerprint less consistent.

## Route Checklist

- Declare `browser: true` in Feed metadata.
- Acquire through `browser.acquirePage()` or `browser.acquireContext()`; do not launch Puppeteer inside a route.
- Configure cookies, interception, response waits, and fingerprint values before navigation.
- Bound multi-page work to `browser.maxPagesPerContext`.
- Close every page or context lease in `finally`.
- Prefer one context when pages must share a session; prefer private page leases for isolated tasks.
- Wrap expensive browser work in `cache.tryGet()` when the result can be reused safely.
