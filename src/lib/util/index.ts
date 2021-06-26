import { forEach, findIndex, find, isNil, map, filter, reduce, includes, orderBy } from "lodash";

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

export const updateFieldOrdering = <T = string>(
  fieldOrdering: FieldOrdering<T>,
  field: T,
  order: Order
): FieldOrdering<T> => {
  if (order === 0) {
    return filter(fieldOrdering, (fieldO: FieldOrder<T>) => fieldO.field !== field);
  }
  const fieldOrder = find(fieldOrdering, (fieldO: FieldOrder<T>) => fieldO.field === field);
  if (!isNil(fieldOrder)) {
    return replaceInArray<FieldOrder<T>>(fieldOrdering, { field }, { ...fieldOrder, order });
  } else {
    return [...fieldOrdering, { field: field, order }];
  }
};

export const orderByFieldOrdering = <M = any>(array: M[], fieldOrdering: FieldOrdering<keyof M>): M[] => {
  return orderBy(
    array,
    map(fieldOrdering, (fieldOrder: FieldOrder<keyof M>) => fieldOrder.field),
    map(fieldOrdering, (fieldOrder: FieldOrder<keyof M>) => (fieldOrder.order === 1 ? "asc" : "desc"))
  );
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

/* prettier-ignore */
export const getKeyValue =
  <T extends object, U extends keyof T>(key: U) =>
    (obj: T) =>
      obj[key];
