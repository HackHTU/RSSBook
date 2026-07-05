import { describe, expect, test } from "bun:test";
import type { Data } from "@/types";
import { getRouteData } from "@/utils/tests/source";
import source from ".";

function expectData(data: Data) {
	expect(data.title.length).toBeGreaterThan(0);
	expect(data.link).toStartWith("https://");
	expect(data.item?.length).toBeGreaterThan(0);
}

describe("Pingwest", () => {
	test("fetches status news", async () => {
		const data = await getRouteData(source, "/status");

		expectData(data);
	}, 20_000);

	test("fetches tag articles", async () => {
		const data = await getRouteData(source, "/tag/ChinaJoy/1");

		expectData(data);
	}, 20_000);

	test("fetches user articles", async () => {
		const data = await getRouteData(source, "/user/7781550877/article");

		expectData(data);
	}, 20_000);
});
