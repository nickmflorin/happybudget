import { keys, pickBy, isEqual, findIndex } from "lodash";

import * as model from "../model";

// A type that is meant to represent a valid element of an array that is not an Array itself.
export type ArrayPrimitive = null | boolean | number | string | Record<string, unknown>;

export type ArrayCount<T extends ArrayPrimitive> = { value: T; count: number };

/**
 * Counts the frequency of elements in an array, {@link T[]}, and returns an array of elements,
 * {@link ArrayCount<T>[]}, where each element includes the value in the original array, {@link T},
 * along with its frequency.
 *
 * The implementation intentionally returns an array, {@link ArrayCount<T>}, rather than an object
 * keyed by the values and valued by their associated frequency, in order to preserve the ordering
 * of the values in the array and avoid cases where an array of numbers results in an object with
 * string keys.
 *
 * @param {T[]} arr The array of elements for which the frequencies should be returned.
 *
 * @returns {ArrayCount<T>[]}
 */
export const countInArray = <T extends ArrayPrimitive>(
  arr: T[],
  compare?: (a: T, b: T) => boolean,
): ArrayCount<T>[] =>
  arr.reduce((prev: ArrayCount<T>[], curr: T): ArrayCount<T>[] => {
    const indices = keys(
      pickBy(prev, (c: ArrayCount<T>) =>
        compare !== undefined ? compare(c.value, curr) === true : isEqual(c.value, curr),
      ),
    );
    if (indices.length === 0) {
      return [...prev, { count: 1, value: curr }];
    } else if (indices.length !== 1) {
      throw new Error(
        `Unexpected Condition: Multiple indices found for value ${JSON.stringify(curr)}.`,
      );
    }
    prev[parseInt(indices[0])] = {
      ...prev[parseInt(indices[0])],
      count: prev[parseInt(indices[0])].count + 1,
    };
    return prev;
  }, []);

/**
 * Returns an array of elements, {@link T[]}, that were present in the provided array, {@link T[]},
 * more than 1 time.
 *
 * @param {T[]} arr The array of elements for which the duplicates should be returned.
 *
 * @returns {T[]}
 */
export const findDuplicates = <T extends ArrayPrimitive>(
  arr: T[],
  compare?: (a: T, b: T) => boolean,
): T[] => {
  const count = countInArray(arr, compare);
  return count.filter((c: ArrayCount<T>) => c.count > 1).map((c: ArrayCount<T>) => c.value);
};

type ArrayLookupOptions = {
  readonly strict?: false;
};

type _FindInArrayRT<
  T extends Record<string, unknown> | model.Model,
  O extends ArrayLookupOptions | undefined = undefined,
> = O extends { readonly strict: true } ? [T, number] : [T, number] | null;

type Predicate<T extends Record<string, unknown>> =
  | ((obj: T) => boolean)
  | (T extends model.Model ? { id: T["id"] } : never);

const _findInArray = <
  T extends Record<string, unknown> | model.Model,
  O extends ArrayLookupOptions | undefined = undefined,
>(
  data: T[],
  predicate: Predicate<T>,
  options?: O,
): _FindInArrayRT<T, O> => {
  const index = findIndex<T>(data, (obj: T) => {
    if (typeof predicate === "function") {
      return predicate(obj);
    } else if ((obj as model.Model).id === undefined) {
      throw new Error(
        `The object ${JSON.stringify(obj)} does not represent a valid model with an ID.`,
      );
    }
    return obj.id === predicate.id;
  });
  if (index === -1) {
    if (options?.strict !== false) {
      throw new Error("Element defined by predicate not exist in the array.");
    }
    return null as _FindInArrayRT<T, O>;
  }
  return [data[index], index];
};

export const replaceInArray = <
  T extends Record<string, unknown> | model.Model,
  O extends ArrayLookupOptions | undefined = undefined,
>(
  data: T[],
  predicate: Predicate<T>,
  newValue: T,
  options?: O,
): T[] => {
  const result = _findInArray(data, predicate, options);
  if (result === null) {
    return [...data];
  }
  const newArray = [...data];
  newArray[result[1]] = newValue;
  return newArray;
};

export const updateInArray = <
  T extends Record<string, unknown> | model.Model,
  O extends ArrayLookupOptions | undefined = undefined,
>(
  data: T[],
  predicate: Predicate<T>,
  updateValue: Partial<T> | ((obj: T) => Partial<T>),
  options?: O,
): T[] => {
  const result = _findInArray(data, predicate, options);
  if (result === null) {
    return [...data];
  }
  const newArray = [...data];
  const updateData = typeof updateValue === "function" ? updateValue(result[0]) : updateValue;
  newArray[result[1]] = { ...result[0], ...updateData };
  return newArray;
};

export const sumArray = (values: number[]): number =>
  values.reduce((sum: number, val: number) => sum + val, 0);
