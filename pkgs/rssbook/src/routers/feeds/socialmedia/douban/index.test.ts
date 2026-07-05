import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import douban from ".";

describe("Douban", () => {
	test("fetches coming movies", async () => {
		const data = await getRouteData(douban, "/movie/coming");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);

	test("fetches latest books", async () => {
		const data = await getRouteData(douban, "/book/latest");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);
});
