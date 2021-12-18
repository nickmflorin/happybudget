import { shallowEqual } from "react-redux";
import { createSelector, createSelectorCreator, defaultMemoize } from "reselect";
import { isEqual, filter, map } from "lodash";
import { isAuthenticatedStore } from "./typeguards";

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

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const createGlobalSelector = <T = any>(
  authenticatedFunc: Redux.AuthenticatedSelectorFunc<T>,
  UnauthenticatedFunc: Redux.UnauthenticatedSelectorFunc<T>
) => {
  return (state: Application.Store) =>
    isAuthenticatedStore(state) ? authenticatedFunc(state) : UnauthenticatedFunc(state);
};

type LoadingSelector<S extends Application.Store> = (s: S) => boolean | Redux.ModelListActionInstance[] | undefined;

export const createLoadingSelector = <S extends Application.Store>(...selectors: LoadingSelector<S>[]) =>
  createSelector(selectors, (...args: (Redux.ModelListActionInstance[] | boolean | undefined)[]) => {
    return (
      filter(
        map(args, (arg: Redux.ModelListActionInstance[] | boolean) =>
          Array.isArray(arg) ? arg.length !== 0 : arg === true
        ),
        (value: boolean) => value === true
      ).length !== 0
    );
  });
