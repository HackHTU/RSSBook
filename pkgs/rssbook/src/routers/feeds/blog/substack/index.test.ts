import { describe, expect, test } from "bun:test";
import type { Data } from "@/types";
import { getRouteData } from "@/utils/tests/source";
import source from ".";

function expectData(data: Data) {
	expect(data.title.length).toBeGreaterThan(0);
	expect(data.link).toStartWith("https://");
	expect(data.item?.length).toBeGreaterThan(0);
}

describe("Substack", () => {
	test("fetches newsletter feed", async () => {
		const data = await getRouteData(source, "/subscribe/mangoread");

		expectData(data);
	}, 20_000);
});
