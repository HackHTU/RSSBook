import { v5 as uuidv5 } from "uuid";

/**
 * Generate a UUID.
 *
 * - When called without arguments, returns a randomUUID.
 * - When called with any arguments, returns a deterministic v5 UUID
 *   based on the serialized seed values.
 *
 * @example
 * ```ts
 * uuid(); // -> random UUID
 * uuid("user", 42); // -> stable v5 UUID (same inputs => same output)
 * ```
 */
export function uuid(): string;
export function uuid(...seed: unknown[]): string;
export function uuid(...seed: unknown[]): string {
	if (seed.length === 0) return crypto.randomUUID();

	const input = JSON.stringify(seed, (_, value) => {
		if (value === undefined) return "__undefined__";
		return value;
	});
	return uuidv5(input, uuidv5.URL);
}
