import { describe, expect, test } from "bun:test";
import type { Data, DataItem } from "@/types";
import { filter } from "@/utils";

const buildData = (overrides: Partial<Data> = {}, items: DataItem[] = []): Data => {
	const data: Data = {
		description: "Base Description",
		id: "base-id",
		item: items,
		link: "https://example.com",
		title: "Base Title",
		...overrides,
	};
	return data;
};

const buildItem = (overrides: Partial<DataItem> = {}): DataItem => ({
	date: new Date("2024-01-01T00:00:00.000Z"),
	link: "https://example.com/item",
	title: "Item Title",
	...overrides,
});

const getItems = (data: Data): DataItem[] => data.item ?? [];

describe("filter", () => {
	describe("keywords filter", () => {
		test("filters items by include keywords (OR operation)", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "Technology News" }),
				buildItem({ id: "2", title: "AI Development" }),
				buildItem({ id: "3", title: "Sports Update" }),
			]);

			const result = filter(data, {
				keywords: { include: ["technology", "AI"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((i) => i.id)).toEqual(expect.arrayContaining(["1", "2"]));
		});

		test("filters items by exclude keywords", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "Technology News" }),
				buildItem({ id: "2", title: "Spam Content" }),
				buildItem({ id: "3", title: "AI Update" }),
			]);

			const result = filter(data, {
				keywords: { exclude: ["spam"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((i) => i.id)).toEqual(expect.arrayContaining(["1", "3"]));
		});

		test("combines include and exclude keywords", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "Technology News" }),
				buildItem({ id: "2", title: "Technology Spam" }),
				buildItem({ id: "3", title: "Sports Update" }),
			]);

			const result = filter(data, {
				keywords: { exclude: ["spam"], include: ["technology"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("1");
		});

		test("searches in title, description, and content", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "News Article" }),
				buildItem({ description: "About technology trends", id: "2", title: "Daily Update" }),
				buildItem({ content: "This is about AI", id: "3", title: "Another Article" }),
			]);

			const result = filter(data, {
				keywords: { include: ["technology", "AI"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((i) => i.id)).toEqual(expect.arrayContaining(["2", "3"]));
		});

		test("case insensitive search by default", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "TECHNOLOGY News" }),
				buildItem({ id: "2", title: "technology update" }),
				buildItem({ id: "3", title: "Sports" }),
			]);

			const result = filter(data, {
				keywords: { include: ["Technology"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
		});

		test("case sensitive search when enabled", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "TECHNOLOGY News" }),
				buildItem({ id: "2", title: "Technology update" }),
				buildItem({ id: "3", title: "technology today" }),
			]);

			const result = filter(data, {
				keywords: { caseSensitive: true, include: ["Technology"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("2");
		});

		test("returns empty when no items match include keywords", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "Sports News" }),
				buildItem({ id: "2", title: "Weather Update" }),
			]);

			const result = filter(data, {
				keywords: { include: ["technology"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(0);
		});
	});

	describe("date filter", () => {
		test("filters items after a specific date", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-01"), id: "1", title: "Item 1" }),
				buildItem({ date: new Date("2024-01-15"), id: "2", title: "Item 2" }),
				buildItem({ date: new Date("2024-02-01"), id: "3", title: "Item 3" }),
			]);

			const result = filter(data, {
				date: { after: "2024-01-10" },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((i) => i.id)).toEqual(expect.arrayContaining(["2", "3"]));
		});

		test("filters items before a specific date", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-01"), id: "1", title: "Item 1" }),
				buildItem({ date: new Date("2024-01-15"), id: "2", title: "Item 2" }),
				buildItem({ date: new Date("2024-02-01"), id: "3", title: "Item 3" }),
			]);

			const result = filter(data, {
				date: { before: "2024-01-20" },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((i) => i.id)).toEqual(expect.arrayContaining(["1", "2"]));
		});

		test("filters items within a date range", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-01"), id: "1", title: "Item 1" }),
				buildItem({ date: new Date("2024-01-15"), id: "2", title: "Item 2" }),
				buildItem({ date: new Date("2024-02-01"), id: "3", title: "Item 3" }),
				buildItem({ date: new Date("2024-02-15"), id: "4", title: "Item 4" }),
			]);

			const result = filter(data, {
				date: { after: "2024-01-10", before: "2024-02-05" },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((i) => i.id)).toEqual(expect.arrayContaining(["2", "3"]));
		});

		test("accepts Date objects for date filter", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-01"), id: "1", title: "Item 1" }),
				buildItem({ date: new Date("2024-01-15"), id: "2", title: "Item 2" }),
			]);

			const result = filter(data, {
				date: { after: new Date("2024-01-10") },
			});
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("2");
		});

		test("excludes boundary dates (exclusive)", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-10"), id: "1", title: "Item 1" }),
				buildItem({ date: new Date("2024-01-15"), id: "2", title: "Item 2" }),
			]);

			const result = filter(data, {
				date: { after: "2024-01-10" },
			});
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("2");
		});
	});

	describe("author filter", () => {
		test("filters items by include authors", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ author: [{ name: "Alice" }], id: "1", title: "Item 1" }),
				buildItem({ author: [{ name: "Bob" }], id: "2", title: "Item 2" }),
				buildItem({ author: [{ name: "Charlie" }], id: "3", title: "Item 3" }),
			]);

			const result = filter(data, {
				author: { include: ["Alice", "Bob"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((i) => i.id)).toEqual(expect.arrayContaining(["1", "2"]));
		});

		test("filters items by exclude authors", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ author: [{ name: "Alice" }], id: "1", title: "Item 1" }),
				buildItem({ author: [{ name: "Bob" }], id: "2", title: "Item 2" }),
				buildItem({ author: [{ name: "Charlie" }], id: "3", title: "Item 3" }),
			]);

			const result = filter(data, {
				author: { exclude: ["Bob"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((i) => i.id)).toEqual(expect.arrayContaining(["1", "3"]));
		});

		test("handles multiple authors per item", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ author: [{ name: "Alice" }, { name: "Bob" }], id: "1", title: "Item 1" }),
				buildItem({ author: [{ name: "Charlie" }], id: "2", title: "Item 2" }),
			]);

			const result = filter(data, {
				author: { include: ["Bob"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("1");
		});

		test("author filter is case insensitive", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ author: [{ name: "Alice Smith" }], id: "1", title: "Item 1" }),
				buildItem({ author: [{ name: "bob jones" }], id: "2", title: "Item 2" }),
			]);

			const result = filter(data, {
				author: { include: ["alice", "BOB"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
		});

		test("author filter matches partial names", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ author: [{ name: "Alice Smith" }], id: "1", title: "Item 1" }),
				buildItem({ author: [{ name: "Bob Jones" }], id: "2", title: "Item 2" }),
			]);

			const result = filter(data, {
				author: { include: ["Smith"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("1");
		});
	});

	describe("categories filter", () => {
		test("filters items by include categories", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ category: [{ name: "tech" }], id: "1", title: "Item 1" }),
				buildItem({ category: [{ name: "news" }], id: "2", title: "Item 2" }),
				buildItem({ category: [{ name: "sports" }], id: "3", title: "Item 3" }),
			]);

			const result = filter(data, {
				categories: { include: ["tech", "news"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((i) => i.id)).toEqual(expect.arrayContaining(["1", "2"]));
		});

		test("filters items by exclude categories", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ category: [{ name: "tech" }], id: "1", title: "Item 1" }),
				buildItem({ category: [{ name: "spam" }], id: "2", title: "Item 2" }),
				buildItem({ category: [{ name: "news" }], id: "3", title: "Item 3" }),
			]);

			const result = filter(data, {
				categories: { exclude: ["spam"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((i) => i.id)).toEqual(expect.arrayContaining(["1", "3"]));
		});

		test("handles multiple categories per item", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ category: [{ name: "tech" }, { name: "ai" }], id: "1", title: "Item 1" }),
				buildItem({ category: [{ name: "news" }], id: "2", title: "Item 2" }),
			]);

			const result = filter(data, {
				categories: { include: ["ai"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("1");
		});

		test("categories filter is case insensitive", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ category: [{ name: "Technology" }], id: "1", title: "Item 1" }),
				buildItem({ category: [{ name: "NEWS" }], id: "2", title: "Item 2" }),
			]);

			const result = filter(data, {
				categories: { include: ["technology", "news"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
		});
	});

	describe("limit filter", () => {
		test("limits items from start by default", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
				buildItem({ id: "3", title: "Item 3" }),
				buildItem({ id: "4", title: "Item 4" }),
				buildItem({ id: "5", title: "Item 5" }),
			]);

			const result = filter(data, {
				limit: { count: 3 },
			});
			const items = getItems(result);

			expect(items).toHaveLength(3);
			expect(items.map((i) => i.id)).toEqual(["1", "2", "3"]);
		});

		test("limits items from start explicitly", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
				buildItem({ id: "3", title: "Item 3" }),
			]);

			const result = filter(data, {
				limit: { count: 2, fromStart: true },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((i) => i.id)).toEqual(["1", "2"]);
		});

		test("limits items from end", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
				buildItem({ id: "3", title: "Item 3" }),
				buildItem({ id: "4", title: "Item 4" }),
				buildItem({ id: "5", title: "Item 5" }),
			]);

			const result = filter(data, {
				limit: { count: 2, fromStart: false },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((i) => i.id)).toEqual(["4", "5"]);
		});

		test("returns all items when limit exceeds count", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
			]);

			const result = filter(data, {
				limit: { count: 10 },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
		});

		test("limit is applied after other filters", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "Tech News 1" }),
				buildItem({ id: "2", title: "Sports Update" }),
				buildItem({ id: "3", title: "Tech News 2" }),
				buildItem({ id: "4", title: "Tech News 3" }),
			]);

			const result = filter(data, {
				keywords: { include: ["tech"] },
				limit: { count: 2 },
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((i) => i.id)).toEqual(["1", "3"]);
		});
	});

	describe("custom filter function", () => {
		test("filters items using custom function", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
				buildItem({ id: "3", title: "Item 3" }),
			]);

			const result = filter(data, (item) => item.id === "2");
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("2");
		});

		test("custom function receives item and index", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
				buildItem({ id: "3", title: "Item 3" }),
			]);

			const result = filter(data, (_item, index) => index < 2);
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((i) => i.id)).toEqual(["1", "2"]);
		});

		test("custom function with complex logic", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-15"), id: "1", title: "Tech News" }),
				buildItem({ date: new Date("2024-01-01"), id: "2", title: "Tech Update" }),
				buildItem({ date: new Date("2024-01-20"), id: "3", title: "Sports News" }),
			]);

			const result = filter(data, (item) => {
				const isRecent = item.date instanceof Date && item.date > new Date("2024-01-10");
				const isTech = item.title.toLowerCase().includes("tech");
				return isRecent && isTech;
			});
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("1");
		});

		test("custom function can filter by content length", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ content: "Short", id: "1", title: "Item 1" }),
				buildItem({ content: "This is a much longer content", id: "2", title: "Item 2" }),
				buildItem({ content: "Medium length content", id: "3", title: "Item 3" }),
			]);

			const result = filter(data, (item) => (item.content?.length ?? 0) > 10);
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((i) => i.id)).toEqual(expect.arrayContaining(["2", "3"]));
		});
	});

	describe("combined filters", () => {
		test("combines keywords and date filters", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-01"), id: "1", title: "Tech News" }),
				buildItem({ date: new Date("2024-01-15"), id: "2", title: "Tech Update" }),
				buildItem({ date: new Date("2024-01-15"), id: "3", title: "Sports News" }),
			]);

			const result = filter(data, {
				date: { after: "2024-01-10" },
				keywords: { include: ["tech"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("2");
		});

		test("combines author and categories filters", () => {
			const data = buildData({ id: "test" }, [
				buildItem({
					author: [{ name: "Alice" }],
					category: [{ name: "tech" }],
					id: "1",
					title: "Item 1",
				}),
				buildItem({
					author: [{ name: "Alice" }],
					category: [{ name: "news" }],
					id: "2",
					title: "Item 2",
				}),
				buildItem({
					author: [{ name: "Bob" }],
					category: [{ name: "tech" }],
					id: "3",
					title: "Item 3",
				}),
			]);

			const result = filter(data, {
				author: { include: ["Alice"] },
				categories: { include: ["tech"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("1");
		});

		test("combines all filter types", () => {
			const data = buildData({ id: "test" }, [
				buildItem({
					author: [{ name: "Alice" }],
					category: [{ name: "tech" }],
					date: new Date("2024-01-15"),
					id: "1",
					title: "AI News",
				}),
				buildItem({
					author: [{ name: "Alice" }],
					category: [{ name: "tech" }],
					date: new Date("2024-01-01"),
					id: "2",
					title: "AI Update",
				}),
				buildItem({
					author: [{ name: "Bob" }],
					category: [{ name: "tech" }],
					date: new Date("2024-01-15"),
					id: "3",
					title: "AI Article",
				}),
				buildItem({
					author: [{ name: "Alice" }],
					category: [{ name: "tech" }],
					date: new Date("2024-01-20"),
					id: "4",
					title: "AI Feature",
				}),
			]);

			const result = filter(data, {
				author: { include: ["Alice"] },
				categories: { include: ["tech"] },
				date: { after: "2024-01-10" },
				keywords: { include: ["AI"] },
				limit: { count: 1 },
			});
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("1");
		});
	});

	describe("override parameter", () => {
		test("applies override to result metadata", () => {
			const data = buildData(
				{
					description: "Original Description",
					id: "test",
					title: "Original Title",
				},
				[buildItem({ id: "1", title: "Item 1" })],
			);

			const result = filter(
				data,
				{},
				{
					description: "Custom Description",
					title: "Custom Title",
				},
			);

			expect(result.title).toBe("Custom Title");
			expect(result.description).toBe("Custom Description");
			expect(getItems(result)).toHaveLength(1);
		});

		test("override works with custom filter function", () => {
			const data = buildData({ id: "test", title: "Original" }, [
				buildItem({ id: "1", title: "Item 1" }),
			]);

			const result = filter(data, () => true, { title: "Filtered Results" });

			expect(result.title).toBe("Filtered Results");
		});

		test("override does not affect items", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
			]);

			const result = filter(data, { keywords: { include: ["Item 1"] } }, { title: "Custom Title" });

			expect(getItems(result)).toHaveLength(1);
			expect(getItems(result)[0].title).toBe("Item 1");
		});
	});

	describe("edge cases", () => {
		test("handles empty item array", () => {
			const data = buildData({ id: "test" }, []);

			const result = filter(data, { keywords: { include: ["test"] } });
			const items = getItems(result);

			expect(items).toHaveLength(0);
		});

		test("handles undefined item array", () => {
			const data: Data = {
				description: "Test Description",
				id: "test",
				link: "https://example.com",
				title: "Test Title",
			};

			const result = filter(data, { keywords: { include: ["test"] } });

			expect(result.item).toBeUndefined();
		});

		test("handles items with missing properties", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "Item 1" }), // No author, category
				buildItem({
					author: [{ name: "Alice" }],
					category: [{ name: "tech" }],
					id: "2",
					title: "Item 2",
				}),
			]);

			const result = filter(data, {
				author: { include: ["Alice"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("2");
		});

		test("returns all items when no filter options specified", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
			]);

			const result = filter(data, {});
			const items = getItems(result);

			expect(items).toHaveLength(2);
		});

		test("handles single item", () => {
			const data = buildData({ id: "test" }, [buildItem({ id: "1", title: "Tech News" })]);

			const result = filter(data, {
				keywords: { include: ["tech"] },
			});
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("1");
		});

		test("handles large number of items efficiently", () => {
			const items: DataItem[] = [];
			for (let i = 0; i < 1000; i++) {
				items.push(
					buildItem({
						id: `item-${i}`,
						title: i % 2 === 0 ? `Tech Item ${i}` : `Sports Item ${i}`,
					}),
				);
			}

			const data = buildData({ id: "test" }, items);
			const result = filter(data, {
				keywords: { include: ["tech"] },
			});
			const resultItems = getItems(result);

			expect(resultItems).toHaveLength(500);
		});

		test("custom function returning false for all items", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
			]);

			const result = filter(data, () => false);
			const items = getItems(result);

			expect(items).toHaveLength(0);
		});

		test("custom function returning true for all items", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
			]);

			const result = filter(data, () => true);
			const items = getItems(result);

			expect(items).toHaveLength(2);
		});
	});

	describe("preserves data structure", () => {
		test("preserves metadata while filtering items", () => {
			const data = buildData(
				{
					description: "Test Description",
					id: "test-feed",
					language: "en",
					title: "Test Feed",
				},
				[buildItem({ id: "1", title: "Tech Item" }), buildItem({ id: "2", title: "Sports Item" })],
			);

			const result = filter(data, { keywords: { include: ["tech"] } });

			expect(result.id).toBe("test-feed");
			expect(result.title).toBe("Test Feed");
			expect(result.description).toBe("Test Description");
			expect(result.language).toBe("en");
			expect(getItems(result)).toHaveLength(1);
		});

		test("preserves item properties during filter", () => {
			const data = buildData({ id: "test" }, [
				buildItem({
					author: [{ name: "Author 1" }],
					category: [{ name: "tech" }],
					content: "Full content here",
					date: new Date("2024-01-01"),
					description: "Description 1",
					id: "1",
					title: "Tech Item 1",
				}),
			]);

			const result = filter(data, { keywords: { include: ["tech"] } });
			const items = getItems(result);

			expect(items[0].id).toBe("1");
			expect(items[0].author?.[0]?.name).toBe("Author 1");
			expect(items[0].category?.[0]?.name).toBe("tech");
			expect(items[0].content).toBe("Full content here");
			expect(items[0].description).toBe("Description 1");
		});
	});
});
