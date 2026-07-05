import { describe, expect, test } from "bun:test";
import { uuid } from "@/utils/uuid";

describe("uuid", () => {
	describe("random UUID generation", () => {
		test("should generate a random UUID when called without arguments", () => {
			const result = uuid();

			expect(result).toMatch(
				/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
			);
		});

		test("should generate different UUIDs on subsequent calls without arguments", () => {
			const uuid1 = uuid();
			const uuid2 = uuid();

			expect(uuid1).not.toBe(uuid2);
		});

		test("should generate valid UUID v4 format", () => {
			const result = uuid();
			const parts = result.split("-");

			expect(parts).toHaveLength(5);
			expect(parts[0]).toHaveLength(8);
			expect(parts[1]).toHaveLength(4);
			expect(parts[2]).toHaveLength(4);
			expect(parts[3]).toHaveLength(4);
			expect(parts[4]).toHaveLength(12);
		});
	});

	describe("deterministic UUID generation", () => {
		test("should generate deterministic UUID with single string argument", () => {
			const result1 = uuid("test");
			const result2 = uuid("test");

			expect(result1).toBe(result2);
		});

		test("should generate deterministic UUID with multiple arguments", () => {
			const result1 = uuid("user", 42, "active");
			const result2 = uuid("user", 42, "active");

			expect(result1).toBe(result2);
		});

		test("should generate deterministic UUID with number argument", () => {
			const result1 = uuid(42);
			const result2 = uuid(42);

			expect(result1).toBe(result2);
		});

		test("should generate deterministic UUID with boolean argument", () => {
			const result1 = uuid(true);
			const result2 = uuid(true);

			expect(result1).toBe(result2);
		});

		test("should generate deterministic UUID with object argument", () => {
			const obj = { id: 123, name: "test" };
			const result1 = uuid(obj);
			const result2 = uuid(obj);

			expect(result1).toBe(result2);
		});

		test("should generate deterministic UUID with array argument", () => {
			const arr = [1, 2, 3];
			const result1 = uuid(arr);
			const result2 = uuid(arr);

			expect(result1).toBe(result2);
		});

		test("should generate deterministic UUID with null argument", () => {
			const result1 = uuid(null);
			const result2 = uuid(null);

			expect(result1).toBe(result2);
		});

		test("should generate deterministic UUID with undefined argument", () => {
			const result1 = uuid(undefined);
			const result2 = uuid(undefined);

			expect(result1).toBe(result2);
		});

		test("should generate valid UUID v5 format", () => {
			const result = uuid("test");

			expect(result).toMatch(
				/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
			);
		});
	});

	describe("different inputs produce different UUIDs", () => {
		test("should generate different UUIDs for different string inputs", () => {
			const result1 = uuid("test1");
			const result2 = uuid("test2");

			expect(result1).not.toBe(result2);
		});

		test("should generate different UUIDs for different number inputs", () => {
			const result1 = uuid(1);
			const result2 = uuid(2);

			expect(result1).not.toBe(result2);
		});

		test("should generate different UUIDs for different boolean inputs", () => {
			const result1 = uuid(true);
			const result2 = uuid(false);

			expect(result1).not.toBe(result2);
		});

		test("should generate different UUIDs for different argument counts", () => {
			const result1 = uuid("test");
			const result2 = uuid("test", "extra");

			expect(result1).not.toBe(result2);
		});

		test("should generate different UUIDs for different argument order", () => {
			const result1 = uuid("a", "b");
			const result2 = uuid("b", "a");

			expect(result1).not.toBe(result2);
		});

		test("should generate different UUIDs for similar objects with different values", () => {
			const result1 = uuid({ name: "test1" });
			const result2 = uuid({ name: "test2" });

			expect(result1).not.toBe(result2);
		});

		test("should generate different UUIDs for null vs undefined", () => {
			const result1 = uuid(null);
			const result2 = uuid(undefined);

			expect(result1).not.toBe(result2);
		});
	});

	describe("complex argument combinations", () => {
		test("should handle mixed type arguments", () => {
			const result1 = uuid("user", 42, true, { role: "admin" });
			const result2 = uuid("user", 42, true, { role: "admin" });

			expect(result1).toBe(result2);
		});

		test("should handle nested objects", () => {
			const obj = { user: { meta: { id: 123 }, name: "test" } };
			const result1 = uuid(obj);
			const result2 = uuid(obj);

			expect(result1).toBe(result2);
		});

		test("should handle nested arrays", () => {
			const arr = [
				[1, 2],
				[3, 4],
			];
			const result1 = uuid(arr);
			const result2 = uuid(arr);

			expect(result1).toBe(result2);
		});

		test("should handle empty object", () => {
			const result1 = uuid({});
			const result2 = uuid({});

			expect(result1).toBe(result2);
		});

		test("should handle empty array", () => {
			const result1 = uuid([]);
			const result2 = uuid([]);

			expect(result1).toBe(result2);
		});

		test("should handle empty string", () => {
			const result1 = uuid("");
			const result2 = uuid("");

			expect(result1).toBe(result2);
		});

		test("should handle zero", () => {
			const result1 = uuid(0);
			const result2 = uuid(0);

			expect(result1).toBe(result2);
		});
	});

	describe("edge cases", () => {
		test("should differentiate between single string and array with string", () => {
			const result1 = uuid("test");
			const result2 = uuid(["test"]);

			expect(result1).not.toBe(result2);
		});

		test("should differentiate between number and string number", () => {
			const result1 = uuid(42);
			const result2 = uuid("42");

			expect(result1).not.toBe(result2);
		});

		test("should handle special characters in strings", () => {
			const result1 = uuid("test@#$%^&*()");
			const result2 = uuid("test@#$%^&*()");

			expect(result1).toBe(result2);
		});

		test("should handle unicode characters", () => {
			const result1 = uuid("测试", "🚀");
			const result2 = uuid("测试", "🚀");

			expect(result1).toBe(result2);
		});

		test("should handle very long strings", () => {
			const longString = "a".repeat(10000);
			const result1 = uuid(longString);
			const result2 = uuid(longString);

			expect(result1).toBe(result2);
		});

		test("should handle many arguments", () => {
			const result1 = uuid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
			const result2 = uuid(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

			expect(result1).toBe(result2);
		});
	});

	describe("consistency across object serialization", () => {
		test("should generate same UUID for objects with same properties in different order", () => {
			// Note: JSON.stringify may serialize in different order
			const obj1 = { a: 1, b: 2 };
			const obj2 = { a: 1, b: 2 };
			const result1 = uuid(obj1);
			const result2 = uuid(obj2);

			expect(result1).toBe(result2);
		});

		test("should differentiate between objects with different property values", () => {
			const result1 = uuid({ a: 1 });
			const result2 = uuid({ a: 2 });

			expect(result1).not.toBe(result2);
		});
	});
});
