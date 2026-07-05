import { describe, expect, test } from "bun:test";
import type { Data } from "@/types";
import { getRouteData } from "@/utils/tests/source";
import hackernews from ".";

function expectData(data: Data) {
	expect(data.title.length).toBeGreaterThan(0);
	expect(data.link).toStartWith("https://");
	expect(data.item?.length).toBeGreaterThan(0);
}

describe("Hacker News", () => {
	test("fetches news stories", async () => {
		const data = await getRouteData(hackernews, "/news");

		expectData(data);
	}, 20_000);

	test("fetches user submissions", async () => {
		const data = await getRouteData(hackernews, "/submitted/clmul");

		expectData(data);
	}, 20_000);
});
