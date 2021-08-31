import { shallowEqual } from "react-redux";
import { createSelector, createSelectorCreator, defaultMemoize } from "reselect";
import { isEqual, filter, map, isNil } from "lodash";
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

/* eslint-disable indent */
export const createAsyncSelector =
  <S extends Redux.TableStore>(id: Redux.AsyncId) =>
  (selectorFn: (state: S) => any) => {
    return simpleDeepEqualSelector((s: Application.Store) => {
      if (!isNil(s[id])) {
        return selectorFn(s[id]);
      }
      return undefined;
    });
  };
