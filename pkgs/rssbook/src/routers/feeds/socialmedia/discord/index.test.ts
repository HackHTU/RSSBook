import { describe, expect, test } from "bun:test";
import type { Data } from "@/types";
import { getRouteData } from "@/utils/tests/source";
import source from ".";

function expectData(data: Data) {
	expect(data.title.length).toBeGreaterThan(0);
	expect(data.link).toStartWith("https://");
	expect(Array.isArray(data.item)).toBe(true);
}

describe("Discord", () => {
	test("channel messages degrades gracefully without authorization", async () => {
		const data = await getRouteData(source, "/channel/950465850056536084", {
			config: { DISCORD_AUTHORIZATION: "dummy" },
		});

		expectData(data);
	}, 20_000);

	test("guild search degrades gracefully without authorization", async () => {
		const data = await getRouteData(source, "/search/302094807046684672/content=friendly", {
			config: { DISCORD_AUTHORIZATION: "dummy" },
		});

		expectData(data);
	}, 20_000);

	test("quests degrades gracefully without authorization", async () => {
		const data = await getRouteData(source, "/quests", {
			config: { DISCORD_AUTHORIZATION: "dummy" },
		});

		expectData(data);
	}, 20_000);
});
