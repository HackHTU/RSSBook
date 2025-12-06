import type { Data, DataItem } from "@/types/data";

/**
 * Sorts data items by date or using a custom compare function.
 * @param data - The data object containing items to sort
 * @param compare - "date" to sort by date, or a custom compare function
 * @param desc - Whether to sort in descending order (only applies when compare is "date")
 * @returns The sorted data object
 */
function sort(data: Data, compare?: "date", desc?: boolean): Data;

/**
 * Sorts data items using a custom compare function.
 * @param data - The data object containing items to sort
 * @param compare - Custom compare function for sorting
 * @returns The sorted data object
 */
function sort(data: Data, compare: (a: DataItem, b: DataItem) => number): Data;

/**
 * Sorts data items by date or using a custom compare function.
 * @param data - The data object containing items to sort
 * @param compare - Either "date" to sort by date, or a custom compare function (defaults to "date")
 * @param desc - Whether to sort in descending order (defaults to true, only applies when compare is "date")
 * @returns The sorted data object
 */
function sort(
	data: Data,
	compare: "date" | ((a: DataItem, b: DataItem) => number) = "date",
	desc = true,
): Data {
	if (!Array.isArray(data.item) || data.item.length === 0) return data;

	if (compare === "date") {
		data.item.sort((a, b) => {
			const t1 = a.date instanceof Date ? a.date.getTime() : 0;
			const t2 = b.date instanceof Date ? b.date.getTime() : 0;
			return desc ? t2 - t1 : t1 - t2;
		});
	} else if (typeof compare === "function") {
		data.item.sort(compare);
	}
	return data;
}

export { sort };
