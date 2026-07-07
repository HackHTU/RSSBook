export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;
export type MaybeArray<T> = T | T[];
export type NonEmptyArray<T> = [T, ...T[]];
export type Awaitable<T> = T | Promise<T>;
export type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

// Validate slug format: only lowercase letters, numbers, and hyphens are allowed.
type Lower =
	| "a"
	| "b"
	| "c"
	| "d"
	| "e"
	| "f"
	| "g"
	| "h"
	| "i"
	| "j"
	| "k"
	| "l"
	| "m"
	| "n"
	| "o"
	| "p"
	| "q"
	| "r"
	| "s"
	| "t"
	| "u"
	| "v"
	| "w"
	| "x"
	| "y"
	| "z";
type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Hyphen = "-";
type AllowedChar = Lower | Digit | Hyphen;

type _IsValidInternal<S extends string> = S extends ""
	? true
	: S extends `${infer Head}${infer Tail}`
		? Head extends AllowedChar
			? _IsValidInternal<Tail>
			: false
		: false;

type _IsValid<S extends string> = S extends "" ? false : _IsValidInternal<S>;

/**
 * Slug type
 *
 * Only allows lowercase letters, numbers, and hyphens.
 */
export type Slug<S extends string> = _IsValid<S> extends true ? S : never;
