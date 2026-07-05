import { describe, expect, test } from "bun:test";
import Elysia from "elysia";
import { Category, Source } from "@/utils";

describe("category", () => {
	describe("constructor", () => {
		test("should initialize with name and description", () => {
			const category = new Category("tech", "Technology feeds");

			expect(category.name).toBe("tech");
			expect(category.description).toBe("Technology feeds");
			expect(category.sources).toEqual([]);
		});

		test("should handle empty description", () => {
			const category = new Category("news", "");

			expect(category.name).toBe("news");
			expect(category.description).toBe("");
		});

		test("should handle special characters in name", () => {
			const category = new Category("tech-news", "Tech News");

			expect(category.name).toBe("tech-news");
		});
	});

	describe("use", () => {
		test("should add single source to category", () => {
			const category = new Category("tech", "Technology feeds");
			const source = new Source({
				description: "Test source",
				domain: "https://example.com",
				slug: "example",
				title: "Example Source",
			});

			category.use({ source });

			expect(category.sources).toHaveLength(1);
			expect(category.sources[0]).toBe(source);

			expect(category).toBe(category);
		});

		test("should add multiple sources to category", () => {
			const category = new Category("tech", "Technology feeds");
			const source1 = new Source({
				description: "First source",
				domain: "https://source1.com",
				slug: "source1",
				title: "Source 1",
			});
			const source2 = new Source({
				description: "Second source",
				domain: "https://source2.com",
				slug: "source2",
				title: "Source 2",
			});

			category.use({
				source1,
				source2,
			});

			expect(category.sources).toHaveLength(2);
			expect(category.sources[0]).toBe(source1);
			expect(category.sources[1]).toBe(source2);
		});

		test("should allow chaining multiple use calls", () => {
			const category = new Category("tech", "Technology feeds");
			const source1 = new Source({
				description: "First source",
				domain: "https://source1.com",
				slug: "source1",
				title: "Source 1",
			});
			const source2 = new Source({
				description: "Second source",
				domain: "https://source2.com",
				slug: "source2",
				title: "Source 2",
			});
			const source3 = new Source({
				description: "Third source",
				domain: "https://source3.com",
				slug: "source3",
				title: "Source 3",
			});

			category.use({ source1 }).use({ source2, source3 });

			expect(category.sources).toHaveLength(3);
			expect(category.sources[0]).toBe(source1);
			expect(category.sources[1]).toBe(source2);
			expect(category.sources[2]).toBe(source3);
		});

		test("adding same source will throw an error", () => {
			const category = new Category("tech", "Technology feeds");
			const source = new Source({
				description: "First source",
				domain: "https://source1.com",
				slug: "source1",
				title: "Source 1",
			});

			expect(() => {
				category.use({ s1: source, s2: source });
			}).toThrowError();
		});
	});

	describe("integration", () => {
		test("should return Elysia app instance", () => {
			const category = new Category("tech", "Technology feeds");

			const app = category.getApp();

			expect(app).toBeDefined();
			expect(app).toBeInstanceOf(Elysia);
		});
	});
});
