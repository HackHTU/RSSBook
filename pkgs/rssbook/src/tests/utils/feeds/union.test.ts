import { describe, expect, test } from "bun:test";
import type { Data, DataItem } from "@/types";
import { union } from "@/utils/feeds/union";

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

describe("union", () => {
	describe("single feed union", () => {
		test("merges items from base and feed", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", link: "https://example.com/1", title: "Item 1" }),
				buildItem({ id: "2", link: "https://example.com/2", title: "Item 2" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "3", link: "https://example.com/3", title: "Item 3" }),
				buildItem({ id: "4", link: "https://example.com/4", title: "Item 4" }),
			]);

			const result = union(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(4);
			expect(items.map((item) => item.id)).toEqual(expect.arrayContaining(["1", "2", "3", "4"]));
		});

		test("removes duplicate items based on id", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", link: "https://example.com/1", title: "Item 1" }),
				buildItem({ id: "2", link: "https://example.com/2", title: "Item 2" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "1", link: "https://different.com/1", title: "Duplicate Item 1" }),
				buildItem({ id: "3", link: "https://example.com/3", title: "Item 3" }),
			]);

			const result = union(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(3);
			expect(items.map((item) => item.id)).toEqual(expect.arrayContaining(["1", "2", "3"]));
			// Should keep the first occurrence (from base)
			const item1 = items.find((item) => item.id === "1");
			expect(item1?.title).toBe("Item 1");
		});

		test("handles empty base feed", () => {
			const base = buildData({ id: "base" }, []);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "1", link: "https://example.com/1", title: "Item 1" }),
			]);

			const result = union(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("1");
		});

		test("handles empty comparison feed", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", link: "https://example.com/1", title: "Item 1" }),
			]);
			const feed = buildData({ id: "feed" }, []);

			const result = union(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("1");
		});

		test("uses default hash function (id) when available", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "unique-1", link: "https://example.com/1", title: "Item 1" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "unique-1", link: "https://different.com/a", title: "Different Title" }),
				buildItem({ id: "unique-2", link: "https://example.com/2", title: "Item 2" }),
			]);

			const result = union(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((item) => item.id)).toEqual(
				expect.arrayContaining(["unique-1", "unique-2"]),
			);
		});

		test("falls back to title when id is not available", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ link: "https://example.com/1", title: "Shared Title" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ link: "https://different.com/a", title: "Shared Title" }),
				buildItem({ link: "https://example.com/2", title: "Unique Title" }),
			]);

			const result = union(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(2);
			const titles = items.map((item) => item.title);
			expect(titles).toEqual(expect.arrayContaining(["Shared Title", "Unique Title"]));
		});

		test("falls back to link when id and title are not available", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ link: "https://example.com/shared", title: "" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ link: "https://example.com/shared", title: "" }),
				buildItem({ link: "https://example.com/unique", title: "" }),
			]);

			const result = union(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(2);
			const links = items.map((item) => item.link);
			expect(links).toEqual(
				expect.arrayContaining(["https://example.com/shared", "https://example.com/unique"]),
			);
		});
	});

	describe("multiple feeds union", () => {
		test("merges items from all feeds", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
			]);
			const feed1 = buildData({ id: "feed1" }, [
				buildItem({ id: "3", title: "Item 3" }),
				buildItem({ id: "4", title: "Item 4" }),
			]);
			const feed2 = buildData({ id: "feed2" }, [
				buildItem({ id: "5", title: "Item 5" }),
				buildItem({ id: "6", title: "Item 6" }),
			]);

			const result = union(base, [feed1, feed2]);
			const items = getItems(result);

			expect(items).toHaveLength(6);
			expect(items.map((item) => item.id)).toEqual(
				expect.arrayContaining(["1", "2", "3", "4", "5", "6"]),
			);
		});

		test("removes duplicates across all feeds", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
			]);
			const feed1 = buildData({ id: "feed1" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "3", title: "Item 3" }),
			]);
			const feed2 = buildData({ id: "feed2" }, [
				buildItem({ id: "2", title: "Item 2" }),
				buildItem({ id: "4", title: "Item 4" }),
			]);

			const result = union(base, [feed1, feed2]);
			const items = getItems(result);

			expect(items).toHaveLength(4);
			expect(items.map((item) => item.id)).toEqual(expect.arrayContaining(["1", "2", "3", "4"]));
		});

		test("handles empty array of feeds", () => {
			const base = buildData({ id: "base" }, [buildItem({ id: "1", title: "Item 1" })]);

			const result = union(base, []);
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("1");
		});

		test("works with three or more feeds", () => {
			const base = buildData({ id: "base" }, [buildItem({ id: "1", title: "Item 1" })]);
			const feed1 = buildData({ id: "feed1" }, [buildItem({ id: "2", title: "Item 2" })]);
			const feed2 = buildData({ id: "feed2" }, [buildItem({ id: "3", title: "Item 3" })]);
			const feed3 = buildData({ id: "feed3" }, [buildItem({ id: "4", title: "Item 4" })]);

			const result = union(base, [feed1, feed2, feed3]);
			const items = getItems(result);

			expect(items).toHaveLength(4);
			expect(items.map((item) => item.id)).toEqual(expect.arrayContaining(["1", "2", "3", "4"]));
		});

		test("preserves first occurrence when duplicates exist across multiple feeds", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ description: "Base Item", id: "1", title: "Item 1" }),
			]);
			const feed1 = buildData({ id: "feed1" }, [
				buildItem({ description: "Feed1 Item", id: "1", title: "Item 1 Modified" }),
			]);
			const feed2 = buildData({ id: "feed2" }, [
				buildItem({ description: "Feed2 Item", id: "1", title: "Item 1 Different" }),
			]);

			const result = union(base, [feed1, feed2]);
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].description).toBe("Base Item");
			expect(items[0].title).toBe("Item 1");
		});
	});

	describe("custom hash function", () => {
		test("uses custom hash function for deduplication", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", link: "https://example.com/a", title: "Article A" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "99", link: "https://example.com/a", title: "Different Title" }),
				buildItem({ id: "2", link: "https://example.com/b", title: "Article B" }),
			]);

			const result = union(base, feed, undefined, {
				hashFn: (item) => item.link,
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
			const links = items.map((item) => item.link);
			expect(links).toEqual(
				expect.arrayContaining(["https://example.com/a", "https://example.com/b"]),
			);
			// Should keep first occurrence (from base)
			const itemA = items.find((item) => item.link === "https://example.com/a");
			expect(itemA?.id).toBe("1");
		});

		test("custom hash function with numeric return type", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "2", title: "Item 2 Duplicate" }),
				buildItem({ id: "3", title: "Item 3" }),
			]);

			const result = union(base, feed, undefined, {
				hashFn: (item) => Number.parseInt(item.id || "0", 10),
			});
			const items = getItems(result);

			expect(items).toHaveLength(3);
		});

		test("custom hash function with complex logic", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", link: "https://example.com/post-1", title: "Post 1" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "99", link: "https://different.com/post-1", title: "Post 1" }),
				buildItem({ id: "2", link: "https://example.com/post-2", title: "Post 2" }),
			]);

			// Use last segment of link as hash
			const result = union(base, feed, undefined, {
				hashFn: (item) => {
					const segments = item.link.split("/");
					return segments[segments.length - 1];
				},
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((item) => item.id)).toEqual(expect.arrayContaining(["1", "2"]));
		});
	});

	describe("override parameters", () => {
		test("applies override to result metadata", () => {
			const base = buildData({ description: "Base Description", id: "base", title: "Base Title" }, [
				buildItem({ id: "1", title: "Item 1" }),
			]);
			const feed = buildData({ id: "feed" }, [buildItem({ id: "2", title: "Item 2" })]);

			const result = union(base, feed, {
				description: "Custom Description",
				title: "Custom Title",
			});

			expect(result.title).toBe("Custom Title");
			expect(result.description).toBe("Custom Description");
			expect(getItems(result)).toHaveLength(2);
		});

		test("override does not affect items", () => {
			const base = buildData({ id: "base" }, [buildItem({ id: "1", title: "Item 1" })]);
			const feed = buildData({ id: "feed" }, [buildItem({ id: "2", title: "Item 2" })]);

			const result = union(base, feed, { title: "Custom Title" });

			expect(getItems(result)).toHaveLength(2);
			expect(getItems(result)[0].title).toBe("Item 1");
			expect(getItems(result)[1].title).toBe("Item 2");
		});

		test("override with multiple feeds", () => {
			const base = buildData({ id: "base", title: "Original" }, [
				buildItem({ id: "1", title: "Item 1" }),
			]);
			const feeds = [
				buildData({ id: "feed1" }, [buildItem({ id: "2", title: "Item 2" })]),
				buildData({ id: "feed2" }, [buildItem({ id: "3", title: "Item 3" })]),
			];

			const result = union(base, feeds, { title: "Union Results" });

			expect(result.title).toBe("Union Results");
			expect(getItems(result)).toHaveLength(3);
		});
	});

	describe("sorting behavior", () => {
		test("sorts items by date (newest first)", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ date: new Date("2024-01-01"), id: "1", title: "Item 1" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ date: new Date("2024-01-03"), id: "2", title: "Item 2" }),
				buildItem({ date: new Date("2024-01-02"), id: "3", title: "Item 3" }),
			]);

			const result = union(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(3);
			expect(items[0].id).toBe("2"); // 2024-01-03
			expect(items[1].id).toBe("3"); // 2024-01-02
			expect(items[2].id).toBe("1"); // 2024-01-01
		});

		test("handles items with missing dates", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ date: new Date("2024-01-01"), id: "1", title: "Item 1" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "2", title: "Item 2" }), // No date
			]);

			const result = union(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(2);
			// Item with date should come first
			expect(items[0].id).toBe("1");
		});

		test("maintains order when all items have the same date", () => {
			const date = new Date("2024-01-01");
			const base = buildData({ id: "base" }, [buildItem({ date, id: "1", title: "Item 1" })]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ date, id: "2", title: "Item 2" }),
				buildItem({ date, id: "3", title: "Item 3" }),
			]);

			const result = union(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(3);
			// All have same date, should maintain insertion order
			expect(items.map((item) => item.id)).toEqual(["1", "2", "3"]);
		});
	});

	describe("preserves reference feed structure", () => {
		test("uses reference feed metadata by default", () => {
			const base = buildData(
				{
					description: "Base Description",
					id: "base",
					language: "en",
					title: "Base Feed",
				},
				[buildItem({ id: "1", title: "Item 1" })],
			);
			const feed = buildData(
				{
					description: "Feed Description",
					id: "feed",
					title: "Feed Title",
				},
				[buildItem({ id: "2", title: "Item 2" })],
			);

			const result = union(base, feed);

			expect(result.id).toBe("base");
			expect(result.title).toBe("Base Feed");
			expect(result.description).toBe("Base Description");
			expect(result.language).toBe("en");
		});

		test("includes items from all feeds in result", () => {
			const base = buildData({ id: "base" }, [buildItem({ id: "1", title: "Base Item" })]);
			const feed = buildData({ id: "feed" }, [buildItem({ id: "2", title: "Feed Item" })]);

			const result = union(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.find((item) => item.id === "1")?.title).toBe("Base Item");
			expect(items.find((item) => item.id === "2")?.title).toBe("Feed Item");
		});
	});

	describe("edge cases", () => {
		test("handles feeds with undefined item arrays", () => {
			const base = buildData({ id: "base" });
			const feed = buildData({ id: "feed" });

			const result = union(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(0);
		});

		test("handles single item in each feed", () => {
			const base = buildData({ id: "base" }, [buildItem({ id: "1", title: "Item 1" })]);
			const feed = buildData({ id: "feed" }, [buildItem({ id: "2", title: "Item 2" })]);

			const result = union(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((item) => item.id)).toEqual(expect.arrayContaining(["1", "2"]));
		});

		test("handles hash function returning empty string", () => {
			const base = buildData({ id: "base" }, [buildItem({ id: undefined, link: "", title: "" })]);
			const feed = buildData({ id: "feed" }, [buildItem({ id: undefined, link: "", title: "" })]);

			const result = union(base, feed, undefined, {
				hashFn: () => "",
			});
			const items = getItems(result);

			// Empty hash should be filtered out
			expect(items).toHaveLength(0);
		});

		test("handles large number of items efficiently", () => {
			const baseItems: DataItem[] = [];
			const feedItems: DataItem[] = [];

			for (let i = 0; i < 1000; i++) {
				baseItems.push(buildItem({ id: `item-${i}`, title: `Item ${i}` }));
			}

			for (let i = 500; i < 1500; i++) {
				// 500 duplicates, 500 new
				feedItems.push(buildItem({ id: `item-${i}`, title: `Item ${i}` }));
			}

			const base = buildData({ id: "base" }, baseItems);
			const feed = buildData({ id: "feed" }, feedItems);

			const result = union(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(1500); // 1000 from base + 500 new from feed
		});

		test("handles items with null or undefined properties", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", link: "https://example.com/1" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "2", link: "https://example.com/2" }),
			]);

			const result = union(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(2);
		});

		test("deduplicates based on first feed's items", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ description: "First", id: "shared", title: "Shared Item" }),
			]);
			const feed1 = buildData({ id: "feed1" }, [
				buildItem({ description: "Second", id: "shared", title: "Shared Item" }),
			]);
			const feed2 = buildData({ id: "feed2" }, [
				buildItem({ description: "Third", id: "shared", title: "Shared Item" }),
			]);

			const result = union(base, [feed1, feed2]);
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].description).toBe("First");
		});
	});
});
