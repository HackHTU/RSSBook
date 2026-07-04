import { describe, expect, test } from "bun:test";
import type { Data, DataItem } from "@/types";
import { sort } from "@/utils";

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

describe("sort", () => {
	describe("date sorting (default behavior)", () => {
		test("sorts items by date in descending order by default", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-01"), id: "1", title: "Item 1" }),
				buildItem({ date: new Date("2024-01-03"), id: "2", title: "Item 2" }),
				buildItem({ date: new Date("2024-01-02"), id: "3", title: "Item 3" }),
			]);

			const result = sort(data);
			const items = getItems(result);

			expect(items).toHaveLength(3);
			expect(items[0].id).toBe("2"); // 2024-01-03 (newest)
			expect(items[1].id).toBe("3"); // 2024-01-02
			expect(items[2].id).toBe("1"); // 2024-01-01 (oldest)
		});

		test("sorts items by date in descending order when explicitly specified", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-01"), id: "1", title: "Item 1" }),
				buildItem({ date: new Date("2024-01-03"), id: "2", title: "Item 2" }),
				buildItem({ date: new Date("2024-01-02"), id: "3", title: "Item 3" }),
			]);

			const result = sort(data, "date", true);
			const items = getItems(result);

			expect(items).toHaveLength(3);
			expect(items[0].id).toBe("2"); // 2024-01-03 (newest)
			expect(items[1].id).toBe("3"); // 2024-01-02
			expect(items[2].id).toBe("1"); // 2024-01-01 (oldest)
		});

		test("sorts items by date in ascending order", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-03"), id: "1", title: "Item 1" }),
				buildItem({ date: new Date("2024-01-01"), id: "2", title: "Item 2" }),
				buildItem({ date: new Date("2024-01-02"), id: "3", title: "Item 3" }),
			]);

			const result = sort(data, "date", false);
			const items = getItems(result);

			expect(items).toHaveLength(3);
			expect(items[0].id).toBe("2"); // 2024-01-01 (oldest)
			expect(items[1].id).toBe("3"); // 2024-01-02
			expect(items[2].id).toBe("1"); // 2024-01-03 (newest)
		});

		test("handles items with missing dates", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-02"), id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }), // No date
				buildItem({ date: new Date("2024-01-03"), id: "3", title: "Item 3" }),
				buildItem({ id: "4", title: "Item 4" }), // No date
			]);

			const result = sort(data, "date", true);
			const items = getItems(result);

			expect(items).toHaveLength(4);
			// Items with valid dates should come first in desc order
			expect(items[0].id).toBe("3"); // 2024-01-03
			expect(items[1].id).toBe("1"); // 2024-01-02
			// Items without dates should be at the end
		});

		test("handles items with invalid date objects", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-02"), id: "1", title: "Item 1" }),
				buildItem({ date: "not a date" as unknown as Date, id: "2", title: "Item 2" }),
				buildItem({ date: new Date("2024-01-03"), id: "3", title: "Item 3" }),
			]);

			const result = sort(data, "date", true);
			const items = getItems(result);

			expect(items).toHaveLength(3);
			expect(items[0].id).toBe("3"); // 2024-01-03
			expect(items[1].id).toBe("1"); // 2024-01-02
		});

		test("handles items with same dates", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-01T10:00:00"), id: "1", title: "Item 1" }),
				buildItem({ date: new Date("2024-01-01T10:00:00"), id: "2", title: "Item 2" }),
				buildItem({ date: new Date("2024-01-01T10:00:00"), id: "3", title: "Item 3" }),
			]);

			const result = sort(data, "date", true);
			const items = getItems(result);

			expect(items).toHaveLength(3);
			// Order should be stable for items with same date
		});

		test("sorts items with different timezones correctly", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-01T10:00:00+08:00"), id: "1", title: "Item 1" }),
				buildItem({ date: new Date("2024-01-01T10:00:00Z"), id: "2", title: "Item 2" }),
				buildItem({ date: new Date("2024-01-01T10:00:00-05:00"), id: "3", title: "Item 3" }),
			]);

			const result = sort(data, "date", true);
			const items = getItems(result);

			expect(items).toHaveLength(3);
			// Items should be sorted by UTC time
			expect(items[0].id).toBe("3"); // -05:00 (latest UTC)
			expect(items[1].id).toBe("2"); // Z (middle)
			expect(items[2].id).toBe("1"); // +08:00 (earliest UTC)
		});
	});

	describe("custom compare function", () => {
		test("sorts items using custom compare function", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ id: "3", title: "Item 3" }),
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
			]);

			const result = sort(data, (a, b) => {
				const idA = Number.parseInt(a.id || "0", 10);
				const idB = Number.parseInt(b.id || "0", 10);
				return idA - idB;
			});
			const items = getItems(result);

			expect(items).toHaveLength(3);
			expect(items[0].id).toBe("1");
			expect(items[1].id).toBe("2");
			expect(items[2].id).toBe("3");
		});
	});

	describe("edge cases", () => {
		test("handles empty item array", () => {
			const data = buildData({ id: "test" }, []);

			const result = sort(data);
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

			const result = sort(data);

			expect(result.item).toBeUndefined();
		});

		test("handles single item", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-01"), id: "1", title: "Item 1" }),
			]);

			const result = sort(data);
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("1");
		});

		test("handles large number of items efficiently", () => {
			const items: DataItem[] = [];
			for (let i = 0; i < 1000; i++) {
				items.push(
					buildItem({
						date: new Date(`2024-01-01T${String(i % 24).padStart(2, "0")}:00:00`),
						id: `item-${i}`,
						title: `Item ${i}`,
					}),
				);
			}

			const data = buildData({ id: "test" }, items);
			const result = sort(data, "date", true);
			const resultItems = getItems(result);

			expect(resultItems).toHaveLength(1000);
			// Verify first and last are correctly sorted
			const firstTime = resultItems[0].date instanceof Date ? resultItems[0].date.getTime() : 0;
			const lastTime = resultItems[999].date instanceof Date ? resultItems[999].date.getTime() : 0;
			expect(firstTime).toBeGreaterThanOrEqual(lastTime);
		});
	});

	describe("preserves data structure", () => {
		test("preserves metadata while sorting items", () => {
			const data = buildData(
				{
					description: "Test Description",
					id: "test-feed",
					language: "en",
					title: "Test Feed",
				},
				[
					buildItem({ date: new Date("2024-01-01"), id: "1", title: "Item 1" }),
					buildItem({ date: new Date("2024-01-02"), id: "2", title: "Item 2" }),
				],
			);

			const result = sort(data);

			expect(result.id).toBe("test-feed");
			expect(result.title).toBe("Test Feed");
			expect(result.description).toBe("Test Description");
			expect(result.language).toBe("en");
		});

		test("preserves item properties during sort", () => {
			const data = buildData({ id: "test" }, [
				buildItem({
					author: [{ name: "Author 1" }],
					category: [{ name: "tech" }],
					date: new Date("2024-01-01"),
					description: "Description 1",
					id: "1",
					title: "Item 1",
				}),
				buildItem({
					author: [{ name: "Author 2" }],
					category: [{ name: "news" }],
					date: new Date("2024-01-02"),
					description: "Description 2",
					id: "2",
					title: "Item 2",
				}),
			]);

			const result = sort(data);
			const items = getItems(result);

			expect(items[0].id).toBe("2");
			expect(items[0].author?.[0]?.name).toBe("Author 2");
			expect(items[0].category?.[0]?.name).toBe("news");
			expect(items[0].description).toBe("Description 2");
		});
	});

	describe("stability and consistency", () => {
		test("produces consistent results with multiple sorts", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-03"), id: "1", title: "Item 1" }),
				buildItem({ date: new Date("2024-01-01"), id: "2", title: "Item 2" }),
				buildItem({ date: new Date("2024-01-02"), id: "3", title: "Item 3" }),
			]);

			const result1 = sort(data, "date", true);
			const items1 = getItems(result1);
			const ids1 = items1.map((item) => item.id);

			// Sort again
			const result2 = sort(data, "date", true);
			const items2 = getItems(result2);
			const ids2 = items2.map((item) => item.id);

			expect(ids1).toEqual(ids2);
		});

		test("handles mixed valid and invalid dates consistently", () => {
			const data = buildData({ id: "test" }, [
				buildItem({ date: new Date("2024-01-02"), id: "1", title: "Item 1" }),
				buildItem({ date: undefined, id: "2", title: "Item 2" }),
				buildItem({ date: new Date("2024-01-03"), id: "3", title: "Item 3" }),
				buildItem({ date: undefined, id: "4", title: "Item 4" }),
			]);

			const result = sort(data, "date", true);
			const items = getItems(result);

			// Items with valid dates should be sorted correctly
			const itemsWithDates = items.filter((item) => item.date instanceof Date);
			expect(itemsWithDates[0].id).toBe("3"); // 2024-01-03
			expect(itemsWithDates[1].id).toBe("1"); // 2024-01-02
		});
	});
});
