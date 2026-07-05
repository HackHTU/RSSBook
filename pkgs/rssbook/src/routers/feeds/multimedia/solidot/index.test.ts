import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import solidot from ".";

describe("Solidot", () => {
	test("fetches latest stories", async () => {
		const data = await getRouteData(solidot, "/");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);
});
