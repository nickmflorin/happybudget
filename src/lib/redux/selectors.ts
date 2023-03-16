import { isEqual } from "lodash";
import { shallowEqual } from "react-redux";
import { createSelectorCreator, defaultMemoize } from "reselect";

export const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);
export const createShallowEqualSelector = createSelectorCreator(defaultMemoize, shallowEqual);

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const simpleDeepEqualSelector = <T = any>(func: Redux.GenericSelectorFunc<any, T>) =>
  createDeepEqualSelector(func, (data: T) => data);

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const simpleShallowEqualSelector = <T = any>(func: Redux.GenericSelectorFunc<any, T>) =>
  createShallowEqualSelector(func, (data: T) => data);
