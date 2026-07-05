import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import wallstreetcn from ".";

describe("Wallstreetcn", () => {
	test("fetches live updates", async () => {
		const data = await getRouteData(wallstreetcn, "/live/global");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);
});
