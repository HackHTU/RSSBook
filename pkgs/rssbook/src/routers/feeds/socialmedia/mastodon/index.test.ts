import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import mastodon from ".";

describe("Mastodon", () => {
	test("fetches local timeline", async () => {
		const data = await getRouteData(mastodon, "/timeline/fosstodon.org");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);

	test("fetches hashtag timeline", async () => {
		const data = await getRouteData(mastodon, "/tag/mastodon.social/news");

		expect(data.item?.length).toBeGreaterThan(0);
	}, 20_000);
});
