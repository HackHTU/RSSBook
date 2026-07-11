import type { Page } from "puppeteer-core";

/** Keep the Accept-Language header and navigator.languages in sync. */
export async function setLanguages(page: Page, languages: readonly string[]): Promise<void> {
	if (languages.length === 0) throw new RangeError("languages must not be empty.");
	const values = [...languages];
	await page.setExtraHTTPHeaders({ "Accept-Language": values.join(",") });
	await page.evaluateOnNewDocument((nextLanguages) => {
		Object.defineProperty(Navigator.prototype, "languages", {
			configurable: true,
			get: () => Object.freeze([...nextLanguages]),
		});
	}, values);
}

/** Override navigator.hardwareConcurrency through Chrome DevTools Protocol. */
export async function setHardwareConcurrency(page: Page, value: number): Promise<void> {
	if (!Number.isInteger(value) || value < 1) {
		throw new RangeError("hardwareConcurrency must be a positive integer.");
	}
	const session = await page.createCDPSession();
	try {
		await session.send("Emulation.setHardwareConcurrencyOverride", {
			hardwareConcurrency: value,
		});
	} finally {
		await session.detach();
	}
}

/** Override navigator.deviceMemory before site scripts execute. */
export async function setDeviceMemory(page: Page, value: number): Promise<void> {
	if (!Number.isFinite(value) || value <= 0) {
		throw new RangeError("deviceMemory must be greater than zero.");
	}
	await page.evaluateOnNewDocument((nextValue) => {
		Object.defineProperty(Navigator.prototype, "deviceMemory", {
			configurable: true,
			get: () => nextValue,
		});
	}, value);
}

/** Override screen.colorDepth and screen.pixelDepth before navigation. */
export async function setColorDepth(page: Page, value: number): Promise<void> {
	if (!Number.isInteger(value) || value < 1) {
		throw new RangeError("colorDepth must be a positive integer.");
	}
	await page.evaluateOnNewDocument((nextValue) => {
		for (const property of ["colorDepth", "pixelDepth"]) {
			Object.defineProperty(Screen.prototype, property, {
				configurable: true,
				get: () => nextValue,
			});
		}
	}, value);
}
