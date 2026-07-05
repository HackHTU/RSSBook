import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import cls from ".";

describe("CLS", () => {
	test("fetches telegraph updates", async () => {
		const data = await getRouteData(cls, "/telegraph");

		expect(data.title).toContain("CLS");
	}, 20_000);
});
