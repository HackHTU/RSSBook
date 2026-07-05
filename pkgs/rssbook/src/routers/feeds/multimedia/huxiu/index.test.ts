import { describe, expect, test } from "bun:test";
import { getRouteData } from "@/utils/tests/source";
import huxiu from ".";

describe("Huxiu", () => {
	test("fetches moments", async () => {
		const data = await getRouteData(huxiu, "/moment");

		expect(data.title).toContain("Huxiu");
	}, 20_000);
});
