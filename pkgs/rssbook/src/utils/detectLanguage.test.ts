import { describe, expect, test } from "bun:test";
import { detectLanguage } from "@/utils";

describe("detectLanguage", () => {
	test("returns undefined for empty string", () => {
		expect(detectLanguage("")).toBeUndefined();
	});

	test("returns undefined for whitespace string", () => {
		expect(detectLanguage("   ")).toBeUndefined();
	});

	test("returns undefined for wildcard", () => {
		expect(detectLanguage("*")).toBeUndefined();
	});

	test("detects exact language match", () => {
		expect(detectLanguage("en")).toBe("en");
		expect(detectLanguage("zh")).toBe("zh");
		expect(detectLanguage("ja")).toBe("ja");
	});

	test("detects language with region code", () => {
		expect(detectLanguage("en-US")).toBe("en-US");
		expect(detectLanguage("zh-CN")).toBe("zh-CN");
		expect(detectLanguage("en-GB")).toBe("en-GB");
	});

	test("handles case insensitivity", () => {
		expect(detectLanguage("EN")).toBe("en");
		expect(detectLanguage("En-Us")).toBe("en-US");
		expect(detectLanguage("ZH-CN")).toBe("zh-CN");
	});

	test("parses quality values and returns highest priority", () => {
		expect(detectLanguage("en;q=0.5,zh;q=0.9")).toBe("zh");
		expect(detectLanguage("ja;q=0.3,en;q=0.8,zh;q=0.5")).toBe("en");
	});

	test("handles multiple languages without quality values", () => {
		expect(detectLanguage("en,zh,ja")).toBe("en");
	});

	test("handles mixed quality values with default q=1", () => {
		expect(detectLanguage("en;q=0.5,zh")).toBe("zh");
		expect(detectLanguage("ja,en;q=0.9")).toBe("ja");
	});

	test("handles complex Accept-Language header", () => {
		expect(detectLanguage("en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7")).toBe("en-US");
		expect(detectLanguage("fr-FR;q=0.5,en-US;q=0.9,zh;q=0.8")).toBe("en-US");
	});

	test("returns 'other' for unknown language", () => {
		expect(detectLanguage("xyz")).toBe("other");
		expect(detectLanguage("unknown-lang")).toBe("other");
	});

	test("handles invalid quality values gracefully", () => {
		expect(detectLanguage("en;q=invalid")).toBe("en");
		expect(detectLanguage("zh;q=")).toBe("zh");
	});

	test("handles whitespace in header", () => {
		expect(detectLanguage("  en  ,  zh  ")).toBe("en");
		expect(detectLanguage(" en-US ; q=0.9 , zh ; q=0.8 ")).toBe("en-US");
	});

	test("filters out empty segments", () => {
		expect(detectLanguage("en,,zh")).toBe("en");
		expect(detectLanguage(",,,en")).toBe("en");
	});
});
