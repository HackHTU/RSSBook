/** biome-ignore-all lint/suspicious/noConsole: test logger */

import { describe, expect, jest, test } from "bun:test";
import { LogLevel, logger } from "@/utils/logger";

describe("logger", () => {
	test("logger.info logs when level is INFO", () => {
		const origInfo = console.info;
		console.info = jest.fn();

		logger.setLevel(LogLevel.INFO);
		logger.info("testing info log");

		expect(console.info).toHaveBeenCalled();

		console.info = origInfo;
	});

	test("logger.debug does not log at INFO level but logs at DEBUG level", () => {
		const origDebug = console.debug;
		console.debug = jest.fn();

		logger.setLevel(LogLevel.INFO);
		logger.debug("this should NOT be logged at INFO");
		expect(console.debug).not.toHaveBeenCalled();

		logger.setLevel(LogLevel.DEBUG);
		logger.debug("this should be logged at DEBUG");
		expect(console.debug).toHaveBeenCalled();

		console.debug = origDebug;
	});
});
