import { uniq } from "lodash";

import * as types from "./types";

export type LiteralsAccessor<V extends string> = types.SpacesToUnderscores<
  types.HyphensToUnderscores<Uppercase<V>>
>;

export type EnumeratedLiteralsConstants<V extends readonly VI[], VI extends string = string> = {
  [key in keyof V & string as LiteralsAccessor<V[key] & string>]: V[key];
};

/**
 * A generic type that results in a type referred to internally as a set of "EnumeratedLiterals",
 * which is formed from the strings defined in the read-only array type defined by the generic type
 * parameter {@link V}.
 *
 * Generally, a set of {@link EnumeratedLiterals} is defined as an object that is used to represent
 * the discrete, literal {@link string} values that a given variable can exhibit, by providing both
 * properties to access the discrete values themselves and a property to access an {@link Array} of
 * all possible discrete values.
 *
 * This type should be used when defining discrete values that a variable can exhibit.
 *
 * Usage
 * -----
 * Assume that we have a variable Permission that can take on values "admin", "dev" or "user".  The
 * {@link EnumeratedLiterals} of those values can be represented as:
 *
 *   EnumeratedLiterals<readonly ["admin", "dev", "user"]>
 *
 * Which will look as follows:
 *
 *   { ADMIN: "admin", DEV: "dev", USER: "user", __ALL__: readonly ["admin", "dev", "user"] }
 */
export type EnumeratedLiterals<
  V extends readonly VI[],
  VI extends string = string,
> = EnumeratedLiteralsConstants<V, VI> & {
  __ALL__: types.UniqueArray<V>;
  /**
   * A type assertion that ensures that the provided value, {@link v}, is in the set of constants
   * included in the literals, {@link EnumeratedLiterals}.
   *
   * @example
   * const ValidSizes = enumeratedLiterals(["small", "medium", "large"] as const);
   * type ValidSize = EnumeratedLiteralType<typeof ValidSizes>;
   *
   * const MyComponent = ({ size, ...props }: { size: ValidSize, ... }): JSX.Element => {
   *   return <></>
   * }
   *
   * const ParentComponent = ({ size, ...props }: { size: string, ... }): JSX.Element => {
   *   // The `size` prop is now type-safe because if it is not a valid size, an error will be
   *   // thrown.
   *   return <MyComponent {...props} size={ValidSizes.validate(size)} />
   * }
   */
  validate: (v: unknown) => V[number];

  /**
   * A type guard that returns whether or not the provided value, {@link v}, is in the set of
   * constants included in the literals, {@link EnumeratedLiterals} and is thus of
   * the type {@link EnumeratedLiteralType} that associated with the set of literals.
   *
   * @example
   * const ValidSizes = enumeratedLiterals(["small", "medium", "large"] as const);
   * type ValidSize = EnumeratedLiteralType<typeof ValidSizes>;
   *
   * const MyComponent = ({ size, ...props }: { size: ValidSize, ... }): JSX.Element => {
   *   return <></>
   * }
   *
   * const ParentComponent = ({ size, ...props }: { size: string, ... }): JSX.Element => {
   *   if (ValidSizes.contains(size)) {
   *     // The `size` prop is now type-safe and guaranteed to be of type ValidSize.
   *     return <MyComponent {...props} size={size} />
   *   }
   *   return <></>
   * }
   */
  contains: (v: unknown) => v is V[number];

  /**
   * Returns a readonly array of values, {@link readonly V[number][]}, that are in the object,
   * {@link EnumeratedLiterals<V>}, but not in the provided set of values, {@link T}.
   *
   * If the excluding values are provided as a string literal or union of string literals,
   * {@link V[number]}, the returned type will be distributed.  If the excluding values are
   * provided as a readonly array that subsets the values in the {@link EnumeratedLiterals<V>},
   * the returned type will not be distributed.
   *
   * @example
   * const Constants = enumeratedLiterals(["a", "b"] as const);
   *
   * const ToRemove: "a" | "b" = "a";
   * // Returns ["b"] as type readonly ["a"] | readonly ["b"] (distributed).
   * const others = Constants.valuesExcluding(ToRemove);
   *
   * @example
   * const Constants = enumeratedLiterals(["a", "b"] as const);
   *
   * const ToRemove = "a" as const;
   * // Returns ["b"] as type readonly ["b"];
   * const others = Constants.valuesExcluding(ToRemove);
   *
   * @example
   * const Constants = enumeratedLiterals(["a", "b", "c", "d"] as const);
   *
   * const ToRemove: ["a", "c"] as const;
   * // Returns ["b", "d"] as type readonly ["b", "d"] (not distributed).
   * const others = Constants.valuesExcluding(ToRemove);
   */
  valuesExcluding: <T extends V[number] | readonly V[number][]>(
    vs: T,
  ) => T extends readonly V[number][]
    ? types.ExcludeFromReadonlyArray<V, T[number]>
    : types.DistributedExcludeFromReadonlyArray<V, T>;

  /**
   * Returns a new set of enumerated literals, {@link EnumeratedLiterals}, that is formed from a
   * subset of the original readonly array, {@link V}, it was created with after the provided
   * readonly array of values, {@link readonly V[number][]}, removed.
   *
   * @example
   * const Constants = enumeratedLiterals(["a", "b", "c", "d"] as const);
   * // EnumeratedLiterals<readonly ["b", "d"]>;
   * const NewConstants = Constants.without(["a", "c"] as const);
   */
  without: <T extends V[number]>(
    vs: T[],
  ) => EnumeratedLiterals<types.ExcludeFromReadonlyArray<V, T>>;

  /**
   * Returns a new enumerated literals, {@link EnumeratedLiteralMap}, that is formed from the
   * original readonly array, {@link V}, that this enumerated literals, {@link EnumeratedLiteralMap}
   * was created with, combined with the elements of an additional readonly array, {@link T},
   * provided as an argument.
   *
   * @example
   * const Constants = enumeratedLiterals(["a", "b"] as const);
   * // EnumeratedLiterals<readonly ["a", "b", "c", "d"]>;
   * const NewConstants = Constants.extend(["c", "d"] as const);
   */
  extend: <T extends readonly string[]>(
    vs: T,
  ) => EnumeratedLiterals<readonly [...types.UniqueArray<V>, ...T]>;
};

/**
 * A generic type that results in the type that was used to construct the {@link EnumeratedLiterals}
 * defined by the generic type parameter, {@link O}.
 */
export type EnumeratedLiteralType<O> = O extends EnumeratedLiterals<infer V> ? V[number] : never;

export type EnumeratedLiteralsMapConstants<
  M extends { [key in K]: V[number] },
  K extends string = string,
  V extends readonly (string | number | boolean)[] = readonly (string | number | boolean)[],
> = {
  [key in keyof M & string as types.SpacesToUnderscores<
    types.HyphensToUnderscores<Uppercase<key>>
  >]: V[number];
};

/**
 * A generic type that results in a type referred to internally as an "EnumeratedLiteralsMap",
 * which is formed from the key-value pairs defined in the mapped type defined by the generic type
 * parameter {@link M}.
 *
 * Generally, an {@link EnumeratedLiteralsMap} is defined as an object that is used to represent the
 * discrete, literal {@link string} values that a given variable can exhibit, by providing both
 * properties to access the discrete values themselves and a property to access an {@link Array} of
 * all possible discrete values.  The properties used to access the discrete values themselves are
 * defined by the keys of the generic type parameter {@link M}.
 *
 * This type should be used when defining discrete values that a variable can exhibit where the
 * lookup keys or names are different than the values of the mapped type.
 *
 * Usage
 * -----
 * Assume that we have a variable StatusCodes that can take on values 200, 400 or 500.  The
 * {@link EnumeratedLiteralsMap} of those values may be represented as:
 *
 *   EnumeratedLiteralMap<{ ok: 200; badRequest: 400; serverError: 500; }>
 *
 * Which will look as follows:
 *
 *   { OK: 200, BADREQUEST: 400, SERVERERROR: 500, __ALL__: readonly [200, 400, 500] }
 */
export type EnumeratedLiteralsMap<
  M extends { [key in K]: V[number] },
  K extends string = string,
  V extends readonly (string | number | boolean)[] = readonly (string | number | boolean)[],
> = EnumeratedLiteralsMapConstants<M, K, V> & {
  __ALL__: V;
  /**
   * A type assertion that ensures that the provided value, {@link v}, is in the set of constants
   * defined by the values of the literals map, {@link EnumeratedLiteralsMap}.
   *
   * @example
   * const FruitColors = enumeratedLiteralsMap({ apple: "red" as const, banana: "yellow" as const })
   * type FruitColor = EnumeratedLiteralMapType<typeof FruitColors>;
   *
   * const MyComponent = ({ color, ...props }: { size: FruitColor, ... }): JSX.Element => {
   *   return <></>
   * }
   *
   * const ParentComponent = ({ color, ...props }: { color: string, ... }): JSX.Element => {
   *   // The `color` prop is now type-safe because if it is not a valid color, an error will be
   *   // thrown.
   *   return <MyComponent {...props} color={FruitColors.validate(color)} />
   * }
   */
  validate: (v: unknown) => V[number];
  /**
   * A type guard that returns whether or not the provided value, {@link v}, is in the set of
   * constants defined by the values of the literals map, {@link EnumeratedLiteralsMap} and is thus
   * of the type {@link EnumeratedLiteralMapType} associated with the map.
   *
   * @example
   * const FruitColors = enumeratedLiteralsMap({ apple: "red" as const, banana: "yellow" as const })
   * type FruitColor = EnumeratedLiteralMapType<typeof FruitColors>;
   *
   * const MyComponent = ({ color, ...props }: { size: FruitColor, ... }): JSX.Element => {
   *   return <></>
   * }
   *
   * const ParentComponent = ({ color, ...props }: { color: string, ... }): JSX.Element => {
   *   if (FruitColors.contains(color)) {
   *     // The `color` prop is now type-safe and guaranteed to be of type FruitColor.
   *     return <MyComponent {...props} color={color} />
   *   }
   *   return <></>
   * }
   */
  contains: (v: unknown) => v is V[number];
};

/**
 * A generic type that results in the type that was used to construct the values of the
 * {@link EnumeratedLiteralsMap} defined by the generic type parameter, {@link O}.
 */
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export type EnumeratedLiteralMapType<O> = O extends EnumeratedLiteralsMap<infer M, infer K, infer V>
  ? V[number]
  : never;

export const toLiteralAccessor = <V extends string = string>(v: V): LiteralsAccessor<V> =>
  v.toUpperCase().replaceAll("-", "_").replaceAll(" ", "_") as LiteralsAccessor<V>;

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
): EnumeratedLiterals<V> => ({
  ...(uniq(data) as types.UniqueArray<V>).reduce(
    (prev: EnumeratedLiteralsConstants<V>, curr: V[number]) => ({
      ...prev,
      [toLiteralAccessor(curr)]: curr,
    }),
    {} as EnumeratedLiteralsConstants<V>,
  ),
  __ALL__: uniq(data) as types.UniqueArray<V>,
  contains(this: EnumeratedLiterals<V>, v: unknown): v is V[number] {
    return typeof v === "string" && this.__ALL__.includes(v);
  },
  validate(this: EnumeratedLiterals<V>, v: unknown): V[number] {
    if (!this.contains(v)) {
      const message = `The value ${v} is not valid, it must be one of ${this.__ALL__.join(", ")}.`;
      throw new Error(message);
    }
    return v;
  },
  valuesExcluding<T extends V[number] | readonly V[number][]>(
    this: EnumeratedLiterals<V>,
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
    this: EnumeratedLiterals<V>,
    vs: T[],
  ): EnumeratedLiterals<types.ExcludeFromReadonlyArray<V, T>> {
    const d = this.__ALL__.filter(
      (v: V[number]) => !vs.includes(v as typeof vs[number]),
    ) as types.ExcludeFromReadonlyArray<V, T>;
    return enumeratedLiterals(d);
  },
  extend<T extends readonly string[]>(
    this: EnumeratedLiterals<V>,
    vs: T,
  ): EnumeratedLiterals<readonly [...types.UniqueArray<V>, ...T]> {
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
): EnumeratedLiteralsMap<M, K, V> => ({
  ...(Object.keys(data) as K[]).reduce(
    (prev: EnumeratedLiteralsMapConstants<M, K, V>, curr: K) => ({
      ...prev,
      [toLiteralAccessor(curr)]: data[curr],
    }),
    {} as EnumeratedLiteralsMapConstants<M, K, V>,
  ),
  __ALL__: Object.values(data) as unknown as V,
  contains(this: EnumeratedLiteralsMap<M, K, V>, v: unknown): v is V[number] {
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
      return this.__ALL__.includes(v);
    }
    return false;
  },
  validate(this: EnumeratedLiteralsMap<M, K, V>, v: unknown): V[number] {
    if (!this.contains(v)) {
      const message = `The value ${v} is not valid, it must be one of ${this.__ALL__.join(", ")}.`;
      throw new Error(message);
    }
    return v;
  },
});
