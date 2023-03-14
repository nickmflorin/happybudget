export type NotArray<T> = T & Exclude<T, Array<unknown>>;

export type InArray<T, X> =
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  T extends readonly [X, ...infer _]
    ? true
    : T extends readonly [X]
    ? true
    : /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    T extends readonly [infer _, ...infer Rest]
    ? InArray<Rest, X>
    : false;

export type ArrayIsUnique<T> = T extends readonly unknown[]
  ? UniqueArray<T> extends Readonly<T>
    ? true
    : false
  : never;

export type UniqueArray<T> = T extends readonly [unknown]
  ? T
  : T extends readonly [infer X, ...infer Rest]
  ? InArray<Rest, X> extends true
    ? "Elements of array are not unique."
    : readonly [X, ...UniqueArray<Rest>]
  : never;

/**
 * A generic type that will result in a readonly tuple, {@link readonly []}, that is formed from
 * the removal of the values corresponding to the second generic type argument {@link I} from the
 * readonly tuple provided as the first generic type argument, {@link A}.
 *
 * @example
 * type V = readonly ["a", "b", "c"];
 * ExcludeFromReadonlyArray<V, "b" | "d">; // readonly ["a", "c"];
 */
export type ExcludeFromReadonlyArray<A extends readonly unknown[], I> = A extends readonly []
  ? readonly []
  : A extends readonly [infer H, ...infer R]
  ? H extends I
    ? ExcludeFromReadonlyArray<R, I>
    : readonly [H, ...ExcludeFromReadonlyArray<R, I>]
  : A;

/**
 * A generic type that will result in a distributed union of readonly tuples, {@link readonly []},
 * that are each formed from the removal of a value in the distributed union corresponding to the
 * second generic type argument {@link I} from the readonly tuple provided as the first generic type
 * argument, {@link A}.
 *
 * @example
 * type V = readonly ["a", "b", "c", "d"];
 * ExcludeFromReadonlyArray<V, "b" | "d">; // readonly ["a", "c", "d"] | readonly ["a", "b", "c"];
 */
export type DistributedExcludeFromReadonlyArray<
  A extends readonly unknown[],
  I,
> = I extends A[number] ? ExcludeFromReadonlyArray<A, I> : never;

/**
 * A generic type that will result in a readonly tuple, {@link readonly []}, that is formed from
 * the intersection of the values corresponding to the second generic type argument {@link I} with
 * the values of the readonly tuple provided as the first generic type argument, {@link A}.
 *
 * @example
 * type V = readonly ["a", "b", "c"];
 * ExtractFromReadonlyArray<V, "b" | "d">; // readonly ["b"];
 */
export type ExtractFromReadonlyArray<A extends readonly unknown[], I> = A extends readonly []
  ? readonly []
  : A extends readonly [infer H, ...infer R]
  ? H extends I
    ? readonly [H, ...ExtractFromReadonlyArray<R, I>]
    : ExtractFromReadonlyArray<R, I>
  : A;

/**
 * A generic type that results in a type in which the provided type, T, is either simply T or T[],
 * as long as T is not an Array.
 */
export type OneOrMany<T> = NotArray<T> | Array<NotArray<T>>;
