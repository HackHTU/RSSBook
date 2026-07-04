import { expectTypeOf, test } from "bun:test";
import type { Slug } from "@/types";

test("Slug type", () => {
	expectTypeOf<Slug<"valid">>().toEqualTypeOf<"valid">();
	expectTypeOf<Slug<"test-123">>().toEqualTypeOf<"test-123">();
	expectTypeOf<Slug<"valid-test-123">>().toEqualTypeOf<"valid-test-123">();
	expectTypeOf<Slug<"Invalid">>().toEqualTypeOf<never>();
	expectTypeOf<Slug<"invalid!">>().toEqualTypeOf<never>();
	expectTypeOf<Slug<"inva lid">>().toEqualTypeOf<never>();
});
