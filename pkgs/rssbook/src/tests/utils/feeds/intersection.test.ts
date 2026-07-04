import { describe, expect, test } from "bun:test";
import type { Data, DataItem } from "@/types";
import { intersection } from "@/utils";

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

describe("intersection", () => {
	describe("single feed intersection", () => {
		test("returns items present in both base and feed", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", link: "https://example.com/1", title: "Item 1" }),
				buildItem({ id: "2", link: "https://example.com/2", title: "Item 2" }),
				buildItem({ id: "3", link: "https://example.com/3", title: "Item 3" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "1", link: "https://example.com/1", title: "Item 1" }),
				buildItem({ id: "2", link: "https://example.com/2", title: "Item 2" }),
			]);

			const result = intersection(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((item) => item.id)).toEqual(expect.arrayContaining(["1", "2"]));
		});

		test("returns empty array when no common items", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", link: "https://example.com/1", title: "Item 1" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "2", link: "https://example.com/2", title: "Item 2" }),
			]);

			const result = intersection(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(0);
		});

		test("handles empty base feed", () => {
			const base = buildData({ id: "base" }, []);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "1", link: "https://example.com/1", title: "Item 1" }),
			]);

			const result = intersection(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(0);
		});

		test("handles empty comparison feed", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", link: "https://example.com/1", title: "Item 1" }),
			]);
			const feed = buildData({ id: "feed" }, []);

			const result = intersection(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(0);
		});

		test("uses default hash function (id) when available", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "unique-1", link: "https://example.com/1", title: "Item 1" }),
				buildItem({ id: "unique-2", link: "https://example.com/2", title: "Item 2" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "unique-1", link: "https://different.com/a", title: "Different Title" }),
			]);

			const result = intersection(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("unique-1");
		});

		test("falls back to title when id is not available", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ link: "https://example.com/1", title: "Shared Title" }),
				buildItem({ link: "https://example.com/2", title: "Unique Title" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ link: "https://different.com/a", title: "Shared Title" }),
			]);

			const result = intersection(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].title).toBe("Shared Title");
		});

		test("falls back to link when id and title are not available", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ link: "https://example.com/shared", title: "" }),
				buildItem({ link: "https://example.com/unique", title: "" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ link: "https://example.com/shared", title: "" }),
			]);

			const result = intersection(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].link).toBe("https://example.com/shared");
		});
	});

	describe("multiple feeds intersection", () => {
		test("returns items present in all feeds", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
				buildItem({ id: "3", title: "Item 3" }),
				buildItem({ id: "4", title: "Item 4" }),
			]);
			const feed1 = buildData({ id: "feed1" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
				buildItem({ id: "3", title: "Item 3" }),
			]);
			const feed2 = buildData({ id: "feed2" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
			]);

			const result = intersection(base, [feed1, feed2]);
			const items = getItems(result);

			expect(items).toHaveLength(2);
			expect(items.map((item) => item.id)).toEqual(expect.arrayContaining(["1", "2"]));
		});

		test("returns empty array when one feed has no common items", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
			]);
			const feed1 = buildData({ id: "feed1" }, [buildItem({ id: "1", title: "Item 1" })]);
			const feed2 = buildData({ id: "feed2" }, [buildItem({ id: "3", title: "Item 3" })]);

			const result = intersection(base, [feed1, feed2]);
			const items = getItems(result);

			expect(items).toHaveLength(0);
		});

		test("handles empty array of feeds", () => {
			const base = buildData({ id: "base" }, [buildItem({ id: "1", title: "Item 1" })]);

			const result = intersection(base, []);
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("1");
		});

		test("works with three or more feeds", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
			]);
			const feed1 = buildData({ id: "feed1" }, [buildItem({ id: "1", title: "Item 1" })]);
			const feed2 = buildData({ id: "feed2" }, [buildItem({ id: "1", title: "Item 1" })]);
			const feed3 = buildData({ id: "feed3" }, [buildItem({ id: "1", title: "Item 1" })]);

			const result = intersection(base, [feed1, feed2, feed3]);
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("1");
		});
	});

	describe("custom hash function", () => {
		test("uses custom hash function for comparison", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", link: "https://example.com/a", title: "Article A" }),
				buildItem({ id: "2", link: "https://example.com/b", title: "Article B" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "99", link: "https://example.com/a", title: "Different Title" }),
			]);

			const result = intersection(base, feed, undefined, {
				hashFn: (item) => item.link,
			});
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].link).toBe("https://example.com/a");
		});

		test("custom hash function with numeric return type", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
				buildItem({ id: "3", title: "Item 3" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
			]);

			const result = intersection(base, feed, undefined, {
				hashFn: (item) => Number.parseInt(item.id || "0", 10),
			});
			const items = getItems(result);

			expect(items).toHaveLength(2);
		});

		test("custom hash function with complex logic", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", link: "https://example.com/post-1", title: "Post 1" }),
				buildItem({ id: "2", link: "https://example.com/post-2", title: "Post 2" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "99", link: "https://different.com/post-1", title: "Post 1" }),
			]);

			// Use last segment of link as hash
			const result = intersection(base, feed, undefined, {
				hashFn: (item) => {
					const segments = item.link.split("/");
					return segments[segments.length - 1];
				},
			});
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("1");
		});
	});

	describe("override parameters", () => {
		test("applies override to result metadata", () => {
			const base = buildData({ description: "Base Description", id: "base", title: "Base Title" }, [
				buildItem({ id: "1", title: "Item 1" }),
			]);
			const feed = buildData({ id: "feed" }, [buildItem({ id: "1", title: "Item 1" })]);

			const result = intersection(base, feed, {
				description: "Custom Description",
				title: "Custom Title",
			});

			expect(result.title).toBe("Custom Title");
			expect(result.description).toBe("Custom Description");
			expect(getItems(result)).toHaveLength(1);
		});

		test("override does not affect items", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
			]);
			const feed = buildData({ id: "feed" }, [buildItem({ id: "1", title: "Item 1" })]);

			const result = intersection(base, feed, { title: "Custom Title" });

			expect(getItems(result)).toHaveLength(1);
			expect(getItems(result)[0].title).toBe("Item 1");
		});

		test("override with multiple feeds", () => {
			const base = buildData({ id: "base", title: "Original" }, [
				buildItem({ id: "1", title: "Item 1" }),
			]);
			const feeds = [
				buildData({ id: "feed1" }, [buildItem({ id: "1", title: "Item 1" })]),
				buildData({ id: "feed2" }, [buildItem({ id: "1", title: "Item 1" })]),
			];

			const result = intersection(base, feeds, { title: "Intersection Results" });

			expect(result.title).toBe("Intersection Results");
			expect(getItems(result)).toHaveLength(1);
		});
	});

	describe("sorting behavior", () => {
		test("sorts items by date (newest first)", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ date: new Date("2024-01-01"), id: "1", title: "Item 1" }),
				buildItem({ date: new Date("2024-01-03"), id: "2", title: "Item 2" }),
				buildItem({ date: new Date("2024-01-02"), id: "3", title: "Item 3" }),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
				buildItem({ id: "3", title: "Item 3" }),
			]);

			const result = intersection(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(3);
			expect(items[0].id).toBe("2"); // 2024-01-03
			expect(items[1].id).toBe("3"); // 2024-01-02
			expect(items[2].id).toBe("1"); // 2024-01-01
		});

		test("handles items with missing dates", () => {
			const base = buildData({ id: "base" }, [
				buildItem({ date: new Date("2024-01-01"), id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }), // No date
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({ id: "1", title: "Item 1" }),
				buildItem({ id: "2", title: "Item 2" }),
			]);

			const result = intersection(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(2);
			// Item with date should come first
			expect(items[0].id).toBe("1");
		});
	});

	describe("preserves reference feed structure", () => {
		test("returns items from reference feed, not comparison feed", () => {
			const base = buildData({ id: "base" }, [
				buildItem({
					description: "Original Description",
					id: "1",
					title: "Original Title",
				}),
			]);
			const feed = buildData({ id: "feed" }, [
				buildItem({
					description: "Different Description",
					id: "1",
					title: "Different Title",
				}),
			]);

			const result = intersection(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].title).toBe("Original Title");
			expect(items[0].description).toBe("Original Description");
		});

		test("preserves base feed metadata by default", () => {
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
				[buildItem({ id: "1", title: "Item 1" })],
			);

			const result = intersection(base, feed);

			expect(result.id).toBe("base");
			expect(result.title).toBe("Base Feed");
			expect(result.description).toBe("Base Description");
			expect(result.language).toBe("en");
		});
	});

	describe("edge cases", () => {
		test("handles feeds with undefined item arrays", () => {
			const base = buildData({ id: "base" });
			const feed = buildData({ id: "feed" });

			const result = intersection(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(0);
		});

		test("handles single item in each feed", () => {
			const base = buildData({ id: "base" }, [buildItem({ id: "1", title: "Item 1" })]);
			const feed = buildData({ id: "feed" }, [buildItem({ id: "1", title: "Item 1" })]);

			const result = intersection(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(1);
			expect(items[0].id).toBe("1");
		});

		test("handles hash function returning empty string", () => {
			const base = buildData({ id: "base" }, [buildItem({ id: undefined, link: "", title: "" })]);
			const feed = buildData({ id: "feed" }, [buildItem({ id: undefined, link: "", title: "" })]);

			const result = intersection(base, feed, undefined, {
				hashFn: () => "",
			});
			const items = getItems(result);

			expect(items).toHaveLength(1);
		});

		test("handles large number of items efficiently", () => {
			const baseItems: DataItem[] = [];
			const feedItems: DataItem[] = [];

			for (let i = 0; i < 1000; i++) {
				baseItems.push(buildItem({ id: `item-${i}`, title: `Item ${i}` }));
				if (i % 2 === 0) {
					// Only even items in feed
					feedItems.push(buildItem({ id: `item-${i}`, title: `Item ${i}` }));
				}
			}

			const base = buildData({ id: "base" }, baseItems);
			const feed = buildData({ id: "feed" }, feedItems);

			const result = intersection(base, feed);
			const items = getItems(result);

			expect(items).toHaveLength(500); // Half of the items
		});
	});
});
