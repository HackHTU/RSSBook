import { describe, expect, test } from "bun:test";
import type { Data } from "@/types";
import { getRouteData } from "@/utils/tests/source";
import source from ".";

function expectData(data: Data) {
	expect(data.title.length).toBeGreaterThan(0);
	expect(data.link).toStartWith("https://");
	expect(data.item?.length).toBeGreaterThan(0);
}

describe("IT Home", () => {
	test("fetches category news", async () => {
		const data = await getRouteData(source, "/it");

		expectData(data);
	}, 20_000);

	test("fetches ranking list", async () => {
		const data = await getRouteData(source, "/ranking/24h");

		expectData(data);
	}, 20_000);

	test("fetches tag articles", async () => {
		const data = await getRouteData(source, "/tag/win11");

		expectData(data);
	}, 20_000);

	test("fetches taiwan feeds", async () => {
		const data = await getRouteData(source, "/tw/news");

		expectData(data);
	}, 20_000);
});
