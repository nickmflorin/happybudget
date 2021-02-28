import { forEach } from "lodash";

/**
 * Merges an object with a default object by looking at the keys of the
 * default object and merging the value if and only if the key did not exist
 * in the original object.
 */
export const mergeWithDefaults = <T = any>(obj: T, defaults: any): T => {
  let merged = { ...obj };
  forEach(defaults, (value: any, key: string) => {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      merged = { ...merged, [key]: value };
    }
  });
  return merged;
};

export const conditionalObj = (obj: any, condition: boolean) => {
  if (condition === true) {
    return obj;
  }
  return {};
};
