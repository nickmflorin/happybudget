import { forEach, findIndex, find, isNil, map, filter, reduce, includes } from "lodash";

export const sumChars = (val: string): number => {
  let sum = 0;
  for (let i = 0; i < val.length; i++) {
    sum += val.charCodeAt(i);
  }
  return sum;
};

export const hashString = (s: string): number =>
  s.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

export const isNodeDescendantOf = (parent: HTMLElement | Element, child: HTMLElement | Element) => {
  var node = child.parentNode;
  while (node != null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};

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

export const includesAnyIn = <T = any>(array: T[], anotherArray: T[] | T): boolean => {
  if (!Array.isArray(anotherArray)) {
    return includes(array, anotherArray);
  }
  let found = false;
  forEach(anotherArray, (item: T) => {
    if (includes(array, item)) {
      found = true;
      return false;
    }
  });
  return found;
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
export const mergeWithDefaults = <T extends object>(obj: Partial<T>, defaults: T): T => {
  let merged = { ...obj };
  forEach(defaults, (value: any, key: string) => {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      merged = { ...merged, [key]: value };
    }
  });
  return merged as T;
};

export const conditionalObj = <T = any>(obj: T, condition: boolean): Partial<T> => {
  if (condition === true) {
    return obj;
  }
  return {};
};

export const getKeyValue = <T extends object, U extends keyof T>(key: U) => (obj: T) => obj[key];
