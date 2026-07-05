import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import theverge from ".";

describe("The Verge", () => {
	test("fetches front page", async () => {
		const data = await getRouteData(theverge, "/");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);
});
