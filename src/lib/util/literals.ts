import { uniq } from "lodash";

import * as types from "./types";

export const toLiteralAccessor = <V extends string = string>(v: V): types.LiteralsAccessor<V> =>
  v.toUpperCase().replaceAll("-", "_").replaceAll(" ", "_") as types.LiteralsAccessor<V>;

/**
 * A generic type that results in a type referred to internally as an "EnumeratedLiteralMap", which
 * is formed from the strings defined in the read-only array type defined by the generic type
 * parameter {@link V}.
 *
 * Generally, an {@link EnumeratedLiterals} is defined as an object that is used to represent the
 * discrete, literal {@link string} values that a given variable can exhibit, by providing both
 * properties to access the discrete values themselves and a property to access an {@link Array} of
 * all possible discrete values.
 *
 * This type should be used when defining discrete values that a variable can exhibit, as it defines
 * both accessors for those constants and an accessor for all possible options.
 *
 * @example
 * const Permissions = enumeratedLiterals(["admin", "dev", "user"] as const)
 * Permissions.ADMIN // "admin"
 * Permissions.__ALL__ // ["admin", "dev", "user"]
 *
 * @param {types.UniqueArray<V>} data
 *   A read-only array of values that the variable is allowed to exhibit.
 *
 * @returns {@link EnumeratedLiterals<V>}
 */
export const enumeratedLiterals = <V extends readonly string[]>(
  data: V,
): types.EnumeratedLiterals<V> => ({
  ...(uniq(data) as types.UniqueArray<V>).reduce(
    (prev: types.EnumeratedLiteralsConstants<V>, curr: V[number]) => ({
      ...prev,
      [toLiteralAccessor(curr)]: curr,
    }),
    {} as types.EnumeratedLiteralsConstants<V>,
  ),
  __ALL__: uniq(data) as types.UniqueArray<V>,
  contains(this: types.EnumeratedLiterals<V>, v: unknown): v is V[number] {
    return typeof v === "string" && this.__ALL__.includes(v);
  },
  validate(this: types.EnumeratedLiterals<V>, v: unknown): V[number] {
    if (!this.contains(v)) {
      const message = `The value ${v} is not valid, it must be one of ${this.__ALL__.join(", ")}.`;
      throw new Error(message);
    }
    return v;
  },
  valuesExcluding<T extends V[number] | readonly V[number][]>(
    this: types.EnumeratedLiterals<V>,
    vs: T,
  ): T extends readonly V[number][]
    ? types.ExcludeFromReadonlyArray<V, T[number]>
    : types.DistributedExcludeFromReadonlyArray<V, T> {
    const d = this.__ALL__.filter((v: V[number]) => !vs.includes(v));
    return d as T extends readonly V[number][]
      ? types.ExcludeFromReadonlyArray<V, T[number]>
      : types.DistributedExcludeFromReadonlyArray<V, T>;
  },
  without<T extends V[number]>(
    this: types.EnumeratedLiterals<V>,
    vs: T[],
  ): types.EnumeratedLiterals<types.ExcludeFromReadonlyArray<V, T>> {
    const d = this.__ALL__.filter(
      (v: V[number]) => !vs.includes(v as typeof vs[number]),
    ) as types.ExcludeFromReadonlyArray<V, T>;
    return enumeratedLiterals(d);
  },
  extend<T extends readonly string[]>(
    this: types.EnumeratedLiterals<V>,
    vs: T,
  ): types.EnumeratedLiterals<readonly [...types.UniqueArray<V>, ...T]> {
    const d: readonly [...types.UniqueArray<V>, ...T] = [...this.__ALL__, ...vs] as const;
    return enumeratedLiterals(d);
  },
});

export const enumeratedLiteralsMap = <
  M extends { [key in K]: V[number] },
  K extends string = string,
  V extends readonly (string | number | boolean)[] = readonly (string | number | boolean)[],
>(
  data: M,
): types.EnumeratedLiteralsMap<M, K, V> => ({
  ...(Object.keys(data) as K[]).reduce(
    (prev: types.EnumeratedLiteralsMapConstants<M, K, V>, curr: K) => ({
      ...prev,
      [toLiteralAccessor(curr)]: data[curr],
    }),
    {} as types.EnumeratedLiteralsMapConstants<M, K, V>,
  ),
  __ALL__: Object.values(data) as unknown as V,
  contains(this: types.EnumeratedLiteralsMap<M, K, V>, v: unknown): v is V[number] {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      return this.__ALL__.includes(v);
    }
    return false;
  },
  validate(this: types.EnumeratedLiteralsMap<M, K, V>, v: unknown): V[number] {
    if (!this.contains(v)) {
      const message = `The value ${v} is not valid, it must be one of ${this.__ALL__.join(", ")}.`;
      throw new Error(message);
    }
    return v;
  },
});
