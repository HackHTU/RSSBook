import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import techcrunch from ".";

describe("TechCrunch", () => {
	test("fetches latest news", async () => {
		const data = await getRouteData(techcrunch, "/news");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);

	test("fetches category", async () => {
		const data = await getRouteData(techcrunch, "/category/17396");

		expect(data.title).toContain("TechCrunch Category");
	}, 20_000);
});
