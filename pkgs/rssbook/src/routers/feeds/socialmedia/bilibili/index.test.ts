import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import bilibili from ".";

describe("Bilibili", () => {
	test("fetches popular videos", async () => {
		const data = await getRouteData(bilibili, "/popular");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);

	test("fetches ranking videos", async () => {
		const data = await getRouteData(bilibili, "/ranking");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);
});
