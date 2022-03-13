import { shallowEqual } from "react-redux";
import { createSelectorCreator, defaultMemoize } from "reselect";
import { isEqual } from "lodash";

export const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);
export const createShallowEqualSelector = createSelectorCreator(defaultMemoize, shallowEqual);

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const simpleDeepEqualSelector = <T = any>(func: Redux.GenericSelectorFunc<any, T>) => {
  return createDeepEqualSelector(func, (data: T) => data);
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const simpleShallowEqualSelector = <T = any>(func: Redux.GenericSelectorFunc<any, T>) => {
  return createShallowEqualSelector(func, (data: T) => data);
};
