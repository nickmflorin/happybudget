import { isEqual } from "lodash";
import { shallowEqual } from "react-redux";
import { createSelectorCreator, defaultMemoize } from "reselect";

import * as types from "./types";

export const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);
export const createShallowEqualSelector = createSelectorCreator(defaultMemoize, shallowEqual);

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const simpleDeepEqualSelector = <T = any>(func: types.GenericSelectorFunc<any, T>) =>
  createDeepEqualSelector(func, (data: T) => data);

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const simpleShallowEqualSelector = <T = any>(func: types.GenericSelectorFunc<any, T>) =>
  createShallowEqualSelector(func, (data: T) => data);

export const selectApplicationLoading = (state: types.ApplicationStore) => state.loading;

export const selectApplicationDrawerOpen = (state: types.ApplicationStore) => state.drawerOpen;

export const selectUser = (s: types.ApplicationStore) => s.user;

export const selectLoggedInUser = (s: types.ApplicationStore) => {
  if (s.user === null) {
    throw new Error("Authenticated user is not present.");
  }
  return s.user;
};

export const selectContacts = simpleDeepEqualSelector(
  (state: types.ApplicationStore) => state.contacts.data,
);
export const selectContactsLoaded = simpleDeepEqualSelector(
  (state: types.ApplicationStore) => state.contacts.responseWasReceived,
);
export const selectContactsLoading = simpleShallowEqualSelector(
  (state: types.ApplicationStore) => state.contacts.loading,
);
export const selectFilteredContacts = simpleDeepEqualSelector(
  (state: types.ApplicationStore) => state.filteredContacts.data,
);
export const selectFilteredContactsLoading = simpleShallowEqualSelector(
  (state: types.ApplicationStore) => state.filteredContacts.loading,
);
export const selectSubAccountUnitStore = simpleDeepEqualSelector(
  (state: types.ApplicationStore) => state.subaccountUnits,
);
export const selectSubAccountUnits = simpleDeepEqualSelector(
  (state: types.ApplicationStore) => state.subaccountUnits.data,
);
export const selectFringeColorStore = simpleDeepEqualSelector(
  (state: types.ApplicationStore) => state.fringeColors,
);
export const selectFringeColors = simpleDeepEqualSelector(
  (state: types.ApplicationStore) => state.fringeColors.data,
);
export const selectActualTypeStore = simpleDeepEqualSelector(
  (state: types.ApplicationStore) => state.actualTypes,
);
export const selectActualTypes = simpleDeepEqualSelector(
  (state: types.ApplicationStore) => state.actualTypes.data,
);
