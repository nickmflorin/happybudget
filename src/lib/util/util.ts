import { uniq } from "lodash";
import { Subtract } from "utility-types";

import * as types from "./types";

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
      [curr.toUpperCase().replaceAll("-", "_").replaceAll(" ", "_")]: curr,
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
      [curr.toUpperCase().replaceAll("-", "_").replaceAll(" ", "_")]: data[curr],
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

/**
 * Returns whether or not the provided attributes, {@link Partial<{ [key in keyof P]: P[key] }>},
 * defined as key-value pairs, have equal associated values in the provided object, {@link P}.
 *
 * @example
 * // Returns true
 * const obj = { foo: 6, bar: 3, apple: 9 };
 * selectedObjAttributesEqual(obj, { apple: 9, foo: 6 })
 *
 * @param {P} obj The object for which the lookup attributes should be checked against.
 * @param {Partial<{ [key in keyof P]: P[key] }>} attrs
 *   Attributes and values that should be checked against the provided object, {@link P}.
 * @param options
 *   Options for the method.
 *   - ignoreUndefined:  When explicitly true, undefined values in the provided {@link attrs} object
 *                       will not be checked for equality but will instead be ignored.
 * @returns {boolean}
 */
export const selectedObjAttributesEqual = <P extends Record<string, unknown>>(
  obj: P,
  attrs: Partial<{ [key in keyof P]: P[key] }>,
  options?: { ignoreUndefined?: boolean },
): boolean => {
  let ignoredAttributes: (keyof P)[] = [];

  /* First, we need to determine the attributes that should be checked against the provided object
     accounting for undefined attribute values that are being explicitly filtered out. */
  let checkAttrs: Partial<{ [key in keyof P]: P[key] }> = {};
  let k: keyof P;
  for (k in attrs) {
    if (!(attrs[k] === undefined && options?.ignoreUndefined === true)) {
      checkAttrs = { ...checkAttrs, [k]: attrs[k] };
    } else {
      ignoredAttributes = [...ignoredAttributes, k];
    }
  }
  /* If there are no attributes that we are checking against, an Error should be thrown because this
     is almost always unintended and should be discouraged as it will always return true. */
  if (Object.keys(checkAttrs).length === 0) {
    let message =
      "Dangerous Function Usage: At least one attribute name-value pair must be provided.";
    if (ignoredAttributes.length !== 0) {
      message = `Dangerous Function Usage: No attribute name-value pairs exist after attribute(s) ${ignoredAttributes.join(
        ", ",
      )} were ignored.`;
    }
    throw new Error(message);
  }
  let attr: keyof P;
  for (attr in checkAttrs) {
    if (obj[attr] !== attrs[attr]) {
      return false;
    }
  }
  return true;
};

/**
 * Returns a new object, {@link Omit<T, K>}, that consists of the key-value pairs of the original
 * object, {@link T}, with the provided keys, {@link K}, removed.
 *
 * @param {T} obj The object for which the attributes should be removed.
 * @param {K} attrs The attributes of the original object that should be removed.
 * @returns {Omit<T, K>} A mutated object with the keys of the original object removed.
 */
export const removeObjAttributes = <
  T extends Partial<Record<K, unknown>>,
  K extends string = string,
>(
  obj: T,
  attrs: K[],
): Omit<T, K> =>
  Object.keys(obj).reduce(
    (prev: Omit<T, K>, curr: string) =>
      attrs.includes(curr as K) ? prev : { ...prev, [curr]: obj[curr as K] },
    {} as Omit<T, K>,
  );

/**
 * Returns a two new objects: (1) a new object constructed from the provided attributes and their
 * associated values on the original object, and (2) a new object constructed from the leftover
 * attributes on the original object after the provided attributes were removed.
 *
 * Usage
 * -----
 * // Returns [{ apple: "fruit" }, { foo: "bar" }]
 * splitObjAttributes({foo: "bar", apple: "fruit"}, ["apple"])
 *
 * @param {T} obj The object for which the attributes should be split.
 * @param {K} attrs
 *   The attributes of the original object that should be removed from the object and inserted into
 *   a new object, {@link Omit<T, Exclude<keyof T, K>>}.
 * @returns {[K, Subtract<T, K>]}
 */
export const pluckObjAttributes = <
  T extends K,
  K extends { [key in N]: T[key] },
  N extends keyof T = keyof Subtract<T, K>,
>(
  obj: T,
  attrs: N[],
): [K, Subtract<T, K>] =>
  Object.keys(obj).reduce(
    (prev: [K, Subtract<T, K>], curr: string): [K, Subtract<T, K>] =>
      attrs.includes(curr as N)
        ? ([{ ...prev[0], [curr]: obj[curr as N] }, prev[1]] as [K, Subtract<T, K>])
        : ([prev[0], { ...prev[1], [curr]: obj[curr as N] }] as [K, Subtract<T, K>]),
    [{}, {}] as [K, Subtract<T, K>],
  );
