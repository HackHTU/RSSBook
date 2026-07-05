import { describe, expect, test } from "bun:test";
import type { Data } from "@/types";
import { getRouteData } from "@/utils/tests/source";
import v2ex from ".";

function expectData(data: Data) {
	expect(data.title.length).toBeGreaterThan(0);
	expect(data.link).toStartWith("https://");
	expect(data.item?.length).toBeGreaterThan(0);
}

describe("V2EX", () => {
	test("fetches latest topics", async () => {
		const data = await getRouteData(v2ex, "/topics/latest");

		expectData(data);
	}, 20_000);

	test("fetches post replies", async () => {
		const data = await getRouteData(v2ex, "/post/1");

		expect(data.title).toContain("V2EX Post");
	}, 20_000);

	test("fetches XNA feed", async () => {
		const data = await getRouteData(v2ex, "/xna");

		expectData(data);
	}, 20_000);

	test("fetches tab topics", async () => {
		const data = await getRouteData(v2ex, "/tab/hot");

		expectData(data);
	}, 20_000);
});
