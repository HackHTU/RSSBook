import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import producthunt from ".";

describe("Product Hunt", () => {
	test("fetches today feed", async () => {
		const data = await getRouteData(producthunt, "/today");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);
});
