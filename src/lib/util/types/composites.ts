import { Required } from "utility-types";

import { PopulatedOrNever, Immutable } from ".";

/**
 * Results in the intersection of {@link A} and {@link B} if both are not {@link never}, otherwise
 * it results in the type {@link A} or {@link B} that is not {@link never}.  If both {@link A} and
 * {@link B} are never, it results in {@link never}.
 */
export type IntersectionUnlessNever<A, B> = [A] extends [never]
  ? [B] extends [never]
    ? never
    : B
  : [B] extends [never]
  ? A
  : A & B;

/**
 * Results in the intersection of {@link A} and {@link B} if both are not empty, otherwise
 * it results in the type {@link A} or {@link B} that is not empty.  If both {@link A} and
 * {@link B} are empty, it results in {@link never}.
 */
export type IntersectionIfPopulated<A, B> = IntersectionUnlessNever<
  PopulatedOrNever<A>,
  PopulatedOrNever<B>
>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (
  x: infer R,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
) => any
  ? R
  : never;

/**
 * A type that results in a boolean type indicating whether or not the generic type parameter
 * {@link T} is a union.
 */
export type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;

/**
 * A generic type that results in a type in which the provided argument, T, is a union of types each
 * of which has one of the keys of T required.
 *
 * @example
 * type Generic = { foo?: string; bar?: string };
 * // { foo: string; bar?: string } | { foo?: string; bar: string }
 * type Required = RequireOne<Generic>
 */
export type RequireOne<T extends Record<string, unknown>> = T &
  {
    [P in keyof T]: Required<T, P>;
  }[keyof T];

/**
 * A generic type that converts a union, {@link U}, provided as a generic type argument to an
 * overloaded function.
 */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type UnionToOverloadedFn<U> = UnionToIntersection<U extends any ? (f: U) => void : never>;

/**
 * A generic type that removes the last type from a union, {@link U}, provided as a generic type
 * argument.
 */
export type PopUnion<U> = UnionToOverloadedFn<U> extends (a: infer A extends U) => void ? A : never;

/**
 * A generic type that converts a union, {@link T}, provided as the first generic type argument,
 * to an array.
 *
 * Note: The second generic type argument, {@link A}, is only for recursive purposes inside the
 * type, {@link UnionToArray} - it is not meant to be provided externally.
 *
 * @example
 * type U = "foo" | "bar";
 * type Arr = UnionToArray<U> // ["foo", "bar"];
 */
export type UnionToArray<T, A extends unknown[] = []> = IsUnion<T> extends true
  ? UnionToArray<Exclude<T, PopUnion<T>>, [PopUnion<T>, ...A]>
  : [T, ...A];

/**
 * A generic type that converts a union, {@link T}, provided as the first generic type argument,
 * to a readonly array.
 *
 * @example
 * type U = "foo" | "bar";
 * type Arr = UnionToReadOnlyArray<U> // readonly ["foo", "bar"];
 */
export type UnionToReadOnlyArray<T> = Immutable<UnionToArray<T>>;
