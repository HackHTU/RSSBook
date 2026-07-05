import { describe, expect, test } from "bun:test";
import type { Data } from "@/types";
import { getRouteData } from "@/utils/tests/source";
import source from ".";

function expectData(data: Data) {
	expect(data.title.length).toBeGreaterThan(0);
	expect(data.link).toStartWith("https://");
	expect(data.item?.length).toBeGreaterThan(0);
}

describe("Leiphone", () => {
	test("fetches home articles", async () => {
		const data = await getRouteData(source, "/index");

		expectData(data);
	}, 20_000);

	test("fetches newsflash", async () => {
		const data = await getRouteData(source, "/newsflash");

		expectData(data);
	}, 20_000);

	test("fetches category articles", async () => {
		const data = await getRouteData(source, "/category/ai");

		expectData(data);
	}, 20_000);
});
