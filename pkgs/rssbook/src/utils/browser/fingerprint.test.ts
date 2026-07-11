import { describe, expect, mock, test } from "bun:test";
import type { CDPSession } from "puppeteer-core";
import { createFakePage } from "@/browser/test-helpers";
import {
	setColorDepth,
	setDeviceMemory,
	setHardwareConcurrency,
	setLanguages,
} from "./fingerprint";

describe("browser fingerprint utilities", () => {
	test("sets languages in both headers and new documents", async () => {
		const page = createFakePage({
			evaluateOnNewDocument: mock(async () => ({ identifier: "language" })),
			setExtraHTTPHeaders: mock(async () => {}),
		});
		await setLanguages(page, ["en-US", "en"]);
		expect(page.setExtraHTTPHeaders).toHaveBeenCalledWith({
			"Accept-Language": "en-US,en",
		});
		expect(page.evaluateOnNewDocument).toHaveBeenCalledTimes(1);
	});

	test("sets hardware concurrency through CDP", async () => {
		const send = mock(async () => ({}));
		const detach = mock(async () => {});
		const page = createFakePage({
			createCDPSession: mock(async () => ({ detach, send }) as unknown as CDPSession),
		});
		await setHardwareConcurrency(page, 8);
		expect(send).toHaveBeenCalledWith("Emulation.setHardwareConcurrencyOverride", {
			hardwareConcurrency: 8,
		});
		expect(detach).toHaveBeenCalledTimes(1);
	});

	test("installs device memory and color depth scripts", async () => {
		const page = createFakePage({
			evaluateOnNewDocument: mock(async () => ({ identifier: "fingerprint" })),
		});
		await setDeviceMemory(page, 8);
		await setColorDepth(page, 24);
		expect(page.evaluateOnNewDocument).toHaveBeenCalledTimes(2);
	});

	test("rejects invalid values", async () => {
		const page = createFakePage();
		await expect(setLanguages(page, [])).rejects.toBeInstanceOf(RangeError);
		await expect(setHardwareConcurrency(page, 0)).rejects.toBeInstanceOf(RangeError);
		await expect(setDeviceMemory(page, 0)).rejects.toBeInstanceOf(RangeError);
		await expect(setColorDepth(page, 0)).rejects.toBeInstanceOf(RangeError);
	});
});
