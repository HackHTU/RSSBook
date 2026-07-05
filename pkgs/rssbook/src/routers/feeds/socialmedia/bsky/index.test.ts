import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import bsky from ".";

describe("Bluesky", () => {
	test("fetches keyword search", async () => {
		const data = await getRouteData(bsky, "/keyword/rss");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);

	test("fetches profile posts", async () => {
		const data = await getRouteData(bsky, "/profile/bsky.app");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);
});
