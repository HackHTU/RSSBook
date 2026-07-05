import { describe, expect, test } from "bun:test";
import type { Data } from "@/types";
import { getRouteData } from "@/utils/tests/source";
import source from ".";

function expectData(data: Data) {
	expect(data.title.length).toBeGreaterThan(0);
	expect(data.link).toStartWith("https://");
	expect(data.item?.length).toBeGreaterThan(0);
}

describe("Geekpark", () => {
	test("fetches home articles", async () => {
		const data = await getRouteData(source, "/index");

		expectData(data);
	}, 20_000);

	test("fetches column articles", async () => {
		const data = await getRouteData(source, "/column/179");

		expectData(data);
	}, 20_000);
});
