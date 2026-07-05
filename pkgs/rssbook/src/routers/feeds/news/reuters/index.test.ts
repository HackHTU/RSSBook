import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import reuters from ".";

describe("Reuters", () => {
	test("fetches section articles", async () => {
		const data = await getRouteData(reuters, "/world");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);
});
