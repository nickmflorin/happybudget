import { findIndex, find, isNil, map, filter } from "lodash";
import { sumChars } from "./string";

export const removeFromArray = (items: any[], key: any, value: any) => {
  const newItems = [...items];
  const index = findIndex(newItems, [key, value]);
  if (index >= 0) {
    newItems.splice(index, 1);
  }
  return newItems;
};

export const replaceInArray = <T>(
  array: T[],
  predicate: ((i: T) => boolean) | { [key: string]: any },
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

export const selectRandom = <T = any>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const selectConsistent = <T = any>(array: T[], name: string): T => {
  const index = sumChars(name) % array.length;
  return array[index];
};

export const filteredMap = <T = any, A = any>(
  array: T[],
  iteree: (element: T) => any,
  filt: (element: A) => boolean = (element: A) => !isNil(element)
): T[] => {
  return filter(map(array, iteree), filt);
};
