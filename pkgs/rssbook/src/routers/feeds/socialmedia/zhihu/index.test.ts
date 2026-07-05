import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import zhihu from ".";

describe("Zhihu", () => {
	test("fetches daily stories", async () => {
		const data = await getRouteData(zhihu, "/daily");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);

	test("fetches hot list", async () => {
		const data = await getRouteData(zhihu, "/hot");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);
});
