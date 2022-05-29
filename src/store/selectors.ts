import { redux } from "lib";

export const selectApplicationLoading = (state: Application.Store) => state.loading;

export const selectApplicationDrawerOpen = (state: Application.Store) => state.drawerOpen;

export const selectUser = (s: Application.Store) => s.user;

export const selectLoggedInUser = (s: Application.Store) => {
  if (s.user === null) {
    throw new Error("Authenticated user is not present.");
  }
  return s.user;
};

export const selectContacts = redux.simpleDeepEqualSelector((state: Application.Store) => state.contacts.data);

export const selectContactsLoaded = redux.simpleDeepEqualSelector(
  (state: Application.Store) => state.contacts.responseWasReceived
);

export const selectContactsLoading = redux.simpleShallowEqualSelector(
  (state: Application.Store) => state.contacts.loading
);

export const selectFilteredContacts = redux.simpleDeepEqualSelector(
  (state: Application.Store) => state.filteredContacts.data
);

export const selectFilteredContactsLoading = redux.simpleShallowEqualSelector(
  (state: Application.Store) => state.filteredContacts.loading
);

export const selectSubAccountUnitStore = redux.simpleDeepEqualSelector(
  (state: Application.Store) => state.subaccountUnits
);
export const selectSubAccountUnits = redux.simpleDeepEqualSelector(
  (state: Application.Store) => state.subaccountUnits.data
);
export const selectFringeColorStore = redux.simpleDeepEqualSelector((state: Application.Store) => state.fringeColors);
export const selectFringeColors = redux.simpleDeepEqualSelector((state: Application.Store) => state.fringeColors.data);
export const selectActualTypeStore = redux.simpleDeepEqualSelector((state: Application.Store) => state.actualTypes);
export const selectActualTypes = redux.simpleDeepEqualSelector((state: Application.Store) => state.actualTypes.data);
