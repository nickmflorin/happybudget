import * as arrays from "./arrays";
import * as strings from "./strings";

export type EnumeratedLiteralsMapConstants<
  V extends readonly VI[],
  VI extends EnumeratedLiteralsString = EnumeratedLiteralsString,
> = {
  [key in keyof V & string as strings.HyphensToUnderscores<Uppercase<V[key] & string>>]: V[key];
};

export type EnumeratedLiteralsString<V extends string = string> = Exclude<
  V,
  "__ALL__" | "contains" | "validate"
>;

/**
 * A generic type that results in a type referred to internally as an "EnumeratedLiteralMap", which
 * is formed from the strings defined in the read-only array type defined by the generic type
 * parameter {@link V}.
 *
 * Generally, an {@link EnumeratedLiteralsMap} is defined as an object that is used to represent the
 * discrete, literal {@link string} values that a given variable can exhibit, by providing both
 * properties to access the discrete values themselves and a property to access an {@link Array} of
 * all possible discrete values.
 *
 * This type should be used when defining discrete values that a variable can exhibit.
 *
 * Usage
 * -----
 * Assume that we have a variable Permission that can take on values "admin", "dev" or "user".  The
 * {@link EnumeratedLiteralsMap} of those values can be represented as:
 *
 *   EnumeratedLiteralMap<readonly ["admin", "dev", "user"]>
 *
 * Which will look as follows:
 *
 *   { ADMIN: "admin", DEV: "dev", USER: "user", __ALL__: readonly ["admin", "dev", "user"] }
 */
export type EnumeratedLiteralsMap<
  V extends readonly VI[],
  VI extends EnumeratedLiteralsString = EnumeratedLiteralsString,
> = EnumeratedLiteralsMapConstants<V, VI> & {
  __ALL__: arrays.UniqueArray<V>;
  /**
   * A type assertion that ensures that the provided value, {@link v}, is in the set of constants
   * included in the literals map, {@link EnumeratedLiteralsMap}.
   *
   * @example
   * const ValidSizes = enumeratedLiteralsMap(["small", "medium", "large"] as const);
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
  validate: (v: string) => V[number];

  /**
   * A type guard that returns whether or not the provided value, {@link v}, is in the set of
   * constants included in the literals map, {@link EnumeratedLiteralsMap} and is thus of
   * the type {@link EnumeratedLiteralType} associated with the map.
   *
   * @example
   * const ValidSizes = enumeratedLiteralsMap(["small", "medium", "large"] as const);
   * type ValidSize = EnumeratedLiteralType<typeof ValidSizes>;
   *
   * const MyComponent = ({ size, ...props }: { size: ValidSize, ... }): JSX.Element => {
   *   return <></>
   * }
   *
   * const ParentComponent = ({ size, ...props }: { size: string, ... }): JSX.Element => {
   *   if (ValidSizes.contains(size)) {
   *     // The `size` prop is now type-safe and guaranteed to be of type ValidSize.
   *     return <MyComponent {...props} size={ValidSizes.validate(size)} />
   *   }
   *   return <></>
   * }
   */
  contains: (v: unknown) => v is V[number];

  /**
   * Returns a readonly array of values, {@link readonly V[number][]}, that are in the object,
   * {@link EnumeratedLiteralMap<V>}, but not in the provided set of values, {@link T}.
   *
   * If the excluding values are provided as a string literal or union of string literals,
   * {@link V[number]}, the returned type will be distributed.  If the excluding values are
   * provided as a readonly array that subsets the values in the {@link EnumeratedLiteralMap<V>},
   * the returned type will not be distributed.
   *
   * @example
   * const Constants = enumeratedLiteralsMap(["a", "b"] as const);
   *
   * const ToRemove: "a" | "b" = "a";
   * // Returns ["b"] as type readonly ["a"] | readonly ["b"] (distributed).
   * const others = Constants.valuesExcluding(ToRemove);
   *
   * @example
   * const Constants = enumeratedLiteralsMap(["a", "b"] as const);
   *
   * const ToRemove = "a" as const;
   * // Returns ["b"] as type readonly ["b"];
   * const others = Constants.valuesExcluding(ToRemove);
   *
   * @example
   * const Constants = enumeratedLiteralsMap(["a", "b", "c", "d"] as const);
   *
   * const ToRemove: ["a", "c"] as const;
   * // Returns ["b", "d"] as type readonly ["b", "d"] (not distributed).
   * const others = Constants.valuesExcluding(ToRemove);
   */
  valuesExcluding: <T extends V[number] | readonly V[number][]>(
    vs: T,
  ) => T extends readonly V[number][]
    ? arrays.ExcludeFromReadonlyArray<V, T[number]>
    : arrays.DistributedExcludeFromReadonlyArray<V, T>;

  /**
   * Returns a new enumerated literals map, {@link EnumeratedLiteralMap}, that is formed from
   * a subset of the original readonly array, {@link V}, it was created with after the provided
   * readonly array of values, {@link readonly V[number][]}, removed.
   *
   * @example
   * const Constants = enumeratedLiteralsMap(["a", "b", "c", "d"] as const);
   * // EnumeratedLiteralsMap<readonly ["b", "d"]>;
   * const NewConstants = Constants.without(["a", "c"] as const);
   */
  without: <T extends V[number]>(
    vs: T[],
  ) => EnumeratedLiteralsMap<arrays.ExcludeFromReadonlyArray<V, T>>;

  /**
   * Returns a new enumerated literals map, {@link EnumeratedLiteralMap}, that is formed from
   * the original readonly array, {@link V}, that this enumerated literals map,
   * {@link EnumeratedLiteralMap}, was created with, combined with the elements of an additional
   * readonly array, {@link T}, provided as an argument.
   *
   * @example
   * const Constants = enumeratedLiteralsMap(["a", "b"] as const);
   * // EnumeratedLiteralsMap<readonly ["a", "b", "c", "d"]>;
   * const NewConstants = Constants.extend(["c", "d"] as const);
   */
  extend: <T extends readonly EnumeratedLiteralsString[]>(
    vs: T,
  ) => EnumeratedLiteralsMap<readonly [...arrays.UniqueArray<V>, ...T]>;
};

/**
 * A generic type that results in the type that was used to construct the
 * {@link EnumeratedLiteralsMap} defined by the generic type parameter, {@link O}.
 */
export type EnumeratedLiteralType<O> = O extends EnumeratedLiteralsMap<infer V> ? V[number] : never;
