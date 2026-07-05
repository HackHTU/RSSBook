import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import thepaper from ".";

describe("The Paper", () => {
	test("fetches featured articles", async () => {
		const data = await getRouteData(thepaper, "/featured");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);
});
