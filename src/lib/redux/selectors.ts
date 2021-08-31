import { shallowEqual } from "react-redux";
import { createSelectorCreator, defaultMemoize } from "reselect";
import { isEqual } from "lodash";
import { isAuthenticatedStore } from "./typeguards";

export const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);
export const createShallowEqualSelector = createSelectorCreator(defaultMemoize, shallowEqual);

export const simpleDeepEqualSelector = <T = any>(func: Redux.GenericSelectorFunc<any, T>) => {
  return createDeepEqualSelector(func, (data: T) => data);
};

export const simpleShallowEqualSelector = <T = any>(func: Redux.GenericSelectorFunc<any, T>) => {
  return createShallowEqualSelector(func, (data: T) => data);
};

export const createGlobalSelector = <T = any>(
  authenticatedFunc: Redux.AuthenticatedSelectorFunc<T>,
  unauthenticatedFunc: Redux.UnauthenticatedSelectorFunc<T>
) => {
  return (state: Modules.StoreObj) =>
    isAuthenticatedStore(state) ? authenticatedFunc(state) : unauthenticatedFunc(state);
};
