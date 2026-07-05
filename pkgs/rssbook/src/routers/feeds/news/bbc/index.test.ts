import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import bbc from ".";

describe("BBC", () => {
	test("fetches news channel", async () => {
		const data = await getRouteData(bbc, "/news/world");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);
});
