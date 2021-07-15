import { shallowEqual } from "react-redux";
import { createSelectorCreator, defaultMemoize } from "reselect";
import { isEqual } from "lodash";

export const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);
export const createShallowEqualSelector = createSelectorCreator(defaultMemoize, shallowEqual);

export const simpleDeepEqualSelector = <T = any>(func: Redux.SelectorFunc<T>) => {
  return createDeepEqualSelector(func, (data: T) => data);
};

export const simpleShallowEqualSelector = <T = any>(func: Redux.SelectorFunc<T>) => {
  return createShallowEqualSelector(func, (data: T) => data);
};

export const selectApplicationLoading = (state: Modules.ApplicationStore) => state.loading;

export const selectContacts = (state: Modules.ApplicationStore) => state.user.contacts;
