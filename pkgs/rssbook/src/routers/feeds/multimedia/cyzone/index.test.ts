import { describe, expect, test } from "bun:test";
import type { Data } from "@/types";
import { getRouteData } from "@/utils/tests/source";
import source from ".";

function expectData(data: Data) {
	expect(data.title.length).toBeGreaterThan(0);
	expect(data.link).toStartWith("https://");
	expect(data.item?.length).toBeGreaterThan(0);
}

describe("Cyzone", () => {
	test("fetches channel news", async () => {
		const data = await getRouteData(source, "/channel/news");

		expectData(data);
	}, 20_000);

	test("fetches author articles", async () => {
		const data = await getRouteData(source, "/author/1225562");

		expectData(data);
	}, 20_000);

	test("fetches label articles", async () => {
		const data = await getRouteData(source, "/label/创业邦周报");

		expectData(data);
	}, 20_000);
});
