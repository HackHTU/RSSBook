import { describe, expect, test } from "bun:test";
import type { Data } from "@/types";
import { getRouteData } from "@/utils/tests/source";
import source from ".";

function expectData(data: Data) {
	expect(data.title.length).toBeGreaterThan(0);
	expect(data.link).toStartWith("https://");
	expect(data.item?.length).toBeGreaterThan(0);
}

describe("Telegram", () => {
	test("fetches channel posts", async () => {
		const data = await getRouteData(source, "/channel/awesomeRSSHub");

		expectData(data);
	}, 20_000);

	test("fetches channel search results", async () => {
		const data = await getRouteData(source, "/channel/awesomeRSSHub/RSSHub");

		expectData(data);
	}, 20_000);
});
