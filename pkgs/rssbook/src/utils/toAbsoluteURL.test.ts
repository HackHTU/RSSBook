import { describe, expect, test } from "bun:test";
import { toAbsoluteURL } from "@/utils/toAbsoluteURL";

describe("toAbsoluteURL", () => {
	describe("empty or invalid inputs", () => {
		test("should return original URL when baseUrl is empty", () => {
			const result = toAbsoluteURL("/path/to/page", "");

			expect(result).toBe("/path/to/page");
		});

		test("should return original URL when url is empty", () => {
			const result = toAbsoluteURL("", "https://example.com");

			expect(result).toBe("");
		});

		test("should return original URL when both are empty", () => {
			const result = toAbsoluteURL("", "");

			expect(result).toBe("");
		});
	});

	describe("absolute URLs", () => {
		test("should return original URL when URL starts with http://", () => {
			const result = toAbsoluteURL("http://example.com/page", "https://base.com");

			expect(result).toBe("http://example.com/page");
		});

		test("should return original URL when URL starts with https://", () => {
			const result = toAbsoluteURL("https://example.com/page", "https://base.com");

			expect(result).toBe("https://example.com/page");
		});

		test("should return original URL when URL starts with HTTP:// (case insensitive)", () => {
			const result = toAbsoluteURL("HTTP://example.com/page", "https://base.com");

			expect(result).toBe("HTTP://example.com/page");
		});

		test("should return original URL when URL starts with HTTPS:// (case insensitive)", () => {
			const result = toAbsoluteURL("HTTPS://example.com/page", "https://base.com");

			expect(result).toBe("HTTPS://example.com/page");
		});

		test("should return original URL when URL starts with //", () => {
			const result = toAbsoluteURL("//example.com/page", "https://base.com");

			expect(result).toBe("//example.com/page");
		});

		test("should handle absolute URL with query parameters", () => {
			const result = toAbsoluteURL("https://example.com/page?foo=bar", "https://base.com");

			expect(result).toBe("https://example.com/page?foo=bar");
		});

		test("should handle absolute URL with hash", () => {
			const result = toAbsoluteURL("https://example.com/page#section", "https://base.com");

			expect(result).toBe("https://example.com/page#section");
		});

		test("should handle absolute URL with port", () => {
			const result = toAbsoluteURL("https://example.com:8080/page", "https://base.com");

			expect(result).toBe("https://example.com:8080/page");
		});
	});

	describe("relative URLs with absolute path", () => {
		test("should convert path starting with / to absolute URL", () => {
			const result = toAbsoluteURL("/path/to/page", "https://example.com");

			expect(result).toBe("https://example.com/path/to/page");
		});

		test("should convert path starting with / using base with path", () => {
			const result = toAbsoluteURL("/new/path", "https://example.com/old/path");

			expect(result).toBe("https://example.com/new/path");
		});

		test("should handle path with query parameters", () => {
			const result = toAbsoluteURL("/path?foo=bar", "https://example.com");

			expect(result).toBe("https://example.com/path?foo=bar");
		});

		test("should handle path with hash", () => {
			const result = toAbsoluteURL("/path#section", "https://example.com");

			expect(result).toBe("https://example.com/path#section");
		});

		test("should handle base URL with port", () => {
			const result = toAbsoluteURL("/path", "https://example.com:8080");

			expect(result).toBe("https://example.com:8080/path");
		});

		test("should handle base URL with trailing slash", () => {
			const result = toAbsoluteURL("/path", "https://example.com/");

			expect(result).toBe("https://example.com/path");
		});

		test("should handle base URL without trailing slash", () => {
			const result = toAbsoluteURL("/path", "https://example.com");

			expect(result).toBe("https://example.com/path");
		});
	});

	describe("relative URLs with relative path", () => {
		test("should convert relative path to absolute URL", () => {
			const result = toAbsoluteURL("page.html", "https://example.com/dir/");

			expect(result).toBe("https://example.com/dir/page.html");
		});

		test("should resolve relative path from base with file", () => {
			const result = toAbsoluteURL("page.html", "https://example.com/dir/index.html");

			expect(result).toBe("https://example.com/dir/page.html");
		});

		test("should handle subdirectory in relative path", () => {
			const result = toAbsoluteURL("subdir/page.html", "https://example.com/dir/");

			expect(result).toBe("https://example.com/dir/subdir/page.html");
		});

		test("should handle parent directory (..) in relative path", () => {
			const result = toAbsoluteURL("../page.html", "https://example.com/dir/subdir/");

			expect(result).toBe("https://example.com/dir/page.html");
		});

		test("should handle multiple parent directories", () => {
			const result = toAbsoluteURL("../../page.html", "https://example.com/a/b/c/");

			expect(result).toBe("https://example.com/a/page.html");
		});

		test("should handle current directory (./) in relative path", () => {
			const result = toAbsoluteURL("./page.html", "https://example.com/dir/");

			expect(result).toBe("https://example.com/dir/page.html");
		});

		test("should handle relative path with query parameters", () => {
			const result = toAbsoluteURL("page.html?foo=bar", "https://example.com/dir/");

			expect(result).toBe("https://example.com/dir/page.html?foo=bar");
		});

		test("should handle relative path with hash", () => {
			const result = toAbsoluteURL("page.html#section", "https://example.com/dir/");

			expect(result).toBe("https://example.com/dir/page.html#section");
		});

		test("should resolve path without base trailing slash", () => {
			const result = toAbsoluteURL("page.html", "https://example.com/dir");

			expect(result).toBe("https://example.com/page.html");
		});
	});

	describe("special cases", () => {
		test("should handle hash-only URL", () => {
			const result = toAbsoluteURL("#section", "https://example.com/page.html");

			expect(result).toBe("https://example.com/page.html#section");
		});

		test("should handle query-only URL", () => {
			const result = toAbsoluteURL("?foo=bar", "https://example.com/page.html");

			expect(result).toBe("https://example.com/page.html?foo=bar");
		});

		test("should handle base URL with query parameters", () => {
			const result = toAbsoluteURL("/path", "https://example.com/page?foo=bar");

			expect(result).toBe("https://example.com/path");
		});

		test("should handle base URL with hash", () => {
			const result = toAbsoluteURL("/path", "https://example.com/page#section");

			expect(result).toBe("https://example.com/path");
		});

		test("should handle http base URL", () => {
			const result = toAbsoluteURL("/path", "http://example.com");

			expect(result).toBe("http://example.com/path");
		});

		test("should handle base URL with subdomain", () => {
			const result = toAbsoluteURL("/path", "https://blog.example.com");

			expect(result).toBe("https://blog.example.com/path");
		});

		test("should handle base URL with authentication", () => {
			const result = toAbsoluteURL("/path", "https://user:pass@example.com");

			expect(result).toBe("https://user:pass@example.com/path");
		});

		test("should handle complex relative path resolution", () => {
			const result = toAbsoluteURL("../other/page.html", "https://example.com/one/two/three/");

			expect(result).toBe("https://example.com/one/two/other/page.html");
		});

		test("should handle URL with encoded characters", () => {
			const result = toAbsoluteURL("/path%20with%20spaces", "https://example.com");

			expect(result).toBe("https://example.com/path%20with%20spaces");
		});

		test("should handle relative URL with encoded characters", () => {
			const result = toAbsoluteURL("page%20name.html", "https://example.com/dir/");

			expect(result).toBe("https://example.com/dir/page%20name.html");
		});
	});

	describe("error handling", () => {
		test("should return original URL when base URL is invalid", () => {
			const result = toAbsoluteURL("/path", "not-a-valid-url");

			expect(result).toBe("/path");
		});

		test("should return original URL when URL constructor throws", () => {
			const result = toAbsoluteURL("invalid:url", "https://example.com");

			expect(result).toBe("invalid:url");
		});

		test("should handle malformed base URL gracefully", () => {
			const result = toAbsoluteURL("/path", "https://");

			expect(result).toBe("/path");
		});

		test("should handle null-like values in URL", () => {
			const result = toAbsoluteURL("undefined", "https://example.com");

			expect(result).toBe("https://example.com/undefined");
		});
	});

	describe("edge cases", () => {
		test("should handle root path", () => {
			const result = toAbsoluteURL("/", "https://example.com");

			expect(result).toBe("https://example.com/");
		});

		test("should handle empty fragment", () => {
			const result = toAbsoluteURL("#", "https://example.com/page");

			expect(result).toBe("https://example.com/page#");
		});

		test("should handle empty query", () => {
			const result = toAbsoluteURL("?", "https://example.com/page");

			expect(result).toBe("https://example.com/page?");
		});

		test("should handle base URL with multiple slashes", () => {
			const result = toAbsoluteURL("/path", "https://example.com//dir//");

			expect(result).toBe("https://example.com/path");
		});

		test("should handle Unicode characters in URL", () => {
			const result = toAbsoluteURL("/путь", "https://example.com");

			expect(result).toBe("https://example.com/%D0%BF%D1%83%D1%82%D1%8C");
		});

		test("should handle Unicode characters in base URL", () => {
			const result = toAbsoluteURL("/path", "https://例え.jp");

			expect(result).toBe("https://xn--r8jz45g.jp/path");
		});

		test("should preserve trailing slash in relative URL", () => {
			const result = toAbsoluteURL("dir/", "https://example.com");

			expect(result).toBe("https://example.com/dir/");
		});

		test("should handle very long URLs", () => {
			const longPath = `/path/${"a".repeat(1000)}`;
			const result = toAbsoluteURL(longPath, "https://example.com");

			expect(result).toBe(`https://example.com${longPath}`);
		});
	});

	describe("protocol-relative URLs", () => {
		test("should preserve protocol-relative URLs starting with //", () => {
			const result = toAbsoluteURL("//cdn.example.com/script.js", "https://example.com");

			expect(result).toBe("//cdn.example.com/script.js");
		});

		test("should preserve protocol-relative URLs with path", () => {
			const result = toAbsoluteURL("//cdn.example.com/path/to/resource", "https://example.com");

			expect(result).toBe("//cdn.example.com/path/to/resource");
		});
	});
});
