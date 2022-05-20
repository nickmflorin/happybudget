import { findIndex, find, isNil, reduce } from "lodash";
import { sumChars } from "./string";

export * as colors from "./colors";
export * as clipboard from "./clipboard";
export * as dates from "./dates";
export * as events from "./events";
export * as files from "./files";
export * as formatters from "../formatters";
export * as html from "./html";
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

export const getKeyValue =
  <T extends Record<string, unknown>, U extends keyof T>(key: U) =>
  (obj: T): T[U] =>
    obj[key];
