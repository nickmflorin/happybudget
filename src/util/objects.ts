import { forEach } from "lodash";

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
