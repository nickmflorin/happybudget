import { IsUnion } from "./composites";

/**
 * A type that results in a string type corresponding to the original string type defined by the
 * first generic type argument {@link T} with the substring defined by the second generic type
 * argument {@link S} removed.
 *
 * With great power comes great responsibility, and this generic type has limitations.  With
 * template literal types in TypeScript, we cannot define, for instance, a type that dictates that
 * a given value can only be a string without certain substrings present.  This can be seen if
 * we use this type as:
 *
 *   type MyString = ExcludeSubString<string, "password">; // string
 *
 * Additionally, there is no way to avoid nasty recursions when using the template string literal
 * inferences that this type requires if it was intended to support types that can be created from
 * removing a union of sub-strings from the base string:
 *
 *   type MyString = ExcludeSubString<"logdatapassword-username.", "password" | "username">;
 *
 * That doesn't mean that this would cause recusions in the below implementation if the conditional
 * checks weren't present, it just means we would have to introduce those recursions to make that
 * work properly.
 *
 * We can however create a type by removing a single sub-string type from a union of base string
 * types:
 *
 *   type MyString = ExcludeSubString<
 *     "logdatapassword-username." | "otherlogdatausername",
 *     "password" | "username"
 *   >; // "logdata-" | "otherlogdata"
 *
 * If we want define a type that is derived from the exclusion of multiple sub-strings from a
 * string literal type, we just need to use this generic multiple times:
 *
 *   // "datafordays"
 *   type MyString = ExcludeSubString<ExcludeSubString<"#data-for-days", "-">, "#">;
 */
export type ExcludeSubString<T extends string, S extends string> = [S] extends [""]
  ? T
  : [T] extends [""]
  ? ""
  : [T] extends [S]
  ? ""
  : T extends "Substring cannot be a union."
  ? T
  : T extends "String cannot be a union."
  ? T
  : IsUnion<S> extends true
  ? "Substring cannot be a union."
  : T extends `${S}${infer Inside extends string}${S}`
  ? ExcludeSubString<Inside, S>
  : T extends `${infer Left extends string}${S}${infer Right extends string}`
  ? `${ExcludeSubString<Left, S>}${ExcludeSubString<Right, S>}`
  : T extends `${S}${infer Right extends string}`
  ? ExcludeSubString<Right, S>
  : T extends `${infer Left extends string}${S}`
  ? ExcludeSubString<Left, S>
  : T;

/**
 * A generic type that results in the length of the string, provided as a generic type argument
 * {@link S}.
 */
export type LengthOfString<
  S extends string,
  A extends 0[] = [],
> = S extends `${string}${infer $Rest}` ? LengthOfString<$Rest, [...A, 0]> : A["length"];

/**
 * A generic type that results in a boolean type indicating whether or not the string, provided
 * as a generic type argument {@link S}, has a certain length dictated by the second generic type
 * argument, {@link L}.
 */
export type StringHasLength<S extends string, L extends number> = LengthOfString<S> extends L
  ? true
  : false;

/**
 * A generic type that enforces that a string type {@link S} has a certain length dictated by the
 * second generic type argument, {@link L}.
 */
export type LengthString<S extends string, L extends number> = StringHasLength<S, L> extends true
  ? S
  : never;

export type HyphensToUnderscores<T extends string> =
  T extends `${infer V extends string}-${infer L extends string}`
    ? HyphensToUnderscores<`${V}_${L}`>
    : T;

export type SpacesToUnderscores<T extends string> =
  T extends `${infer V extends string} ${infer L extends string}`
    ? SpacesToUnderscores<`${V}_${L}`>
    : T;
