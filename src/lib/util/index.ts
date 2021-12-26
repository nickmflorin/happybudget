import { forEach, findIndex, find, isNil, reduce } from "lodash";
import { sumChars } from "./string";

export * as colors from "./colors";
export * as dates from "./dates";
export * as events from "./events";
export * as files from "./files";
export * as formatters from "./formatters";
export * as html from "./html";
export * as urls from "./urls";
export * as validate from "./validate";

export * from "./string";

export const replaceInArray = <T>(
  array: T[],
  predicate: ((i: T) => boolean) | Record<string, unknown>,
  newValue: T
): T[] => {
  const currentValue = find(array, predicate) as T | undefined;
  const newArray = [...array];
  if (!isNil(currentValue)) {
    const index = findIndex<T>(array, currentValue);
    newArray[index] = newValue;
  }
  return newArray;
};

export const updateInArray = <T extends Record<string, unknown>>(
  array: T[],
  predicate: ((i: T) => boolean) | Record<string, unknown>,
  updateValue: Partial<T>
): T[] => {
  const currentValue = find(array, predicate) as T | undefined;
  if (!isNil(currentValue)) {
    return replaceInArray<T>(array, predicate, { ...currentValue, ...updateValue });
  }
  return array;
};

export const selectRandom = <T = Record<string, unknown>>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const selectConsistent = <T = Record<string, unknown>>(array: T[], name: string): T => {
  const index = sumChars(name) % array.length;
  return array[index];
};

export const generateRandomNumericId = (): number => {
  return parseInt(Math.random().toString().slice(2, 11));
};

export const sumArray = (values: number[]): number => {
  return reduce(values, (sum: number, val: number) => sum + val, 0);
};

/**
 * Merges an object with a default object by looking at the keys of the
 * default object and merging the value if and only if the key did not exist
 * in the original object.
 */
export const mergeWithDefaults = <T extends Record<string, unknown>>(obj: Partial<T>, defaults: T): T => {
  let merged = { ...obj };
  forEach(defaults, (value: T[keyof T], key: string) => {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      merged = { ...merged, [key]: value };
    }
  });
  return merged as T;
};

export const getKeyValue =
  <T extends Record<string, unknown>, U extends keyof T>(key: U) =>
  (obj: T): T[U] =>
    obj[key];
