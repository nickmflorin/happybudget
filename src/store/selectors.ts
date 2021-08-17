import { redux } from "lib";

export const selectApplicationLoading = (state: Modules.Store) => state.loading;

export const selectContacts = redux.selectors.createGlobalSelector(
  redux.selectors.simpleDeepEqualSelector((state: Modules.Authenticated.Store) => state.user.contacts.data),
  redux.selectors.simpleDeepEqualSelector((state: Modules.Unauthenticated.Store) => state.contacts.data)
);

export const selectContactsLoading = redux.selectors.createGlobalSelector(
  (state: Modules.Authenticated.Store) => state.user.contacts.loading,
  (state: Modules.Unauthenticated.Store) => state.contacts.loading
);

export const selectContactsSearch = redux.selectors.createGlobalSelector(
  (state: Modules.Authenticated.Store) => state.user.contacts.search,
  (state: Modules.Unauthenticated.Store) => state.contacts.search
);

export const selectSubAccountUnitsLoading = redux.selectors.createGlobalSelector(
  (state: Modules.Authenticated.Store) => state.subAccountUnits.loading,
  (state: Modules.Unauthenticated.Store) => state.subAccountUnits.loading
);

export const selectSubAccountUnits = redux.selectors.createGlobalSelector(
  (state: Modules.Authenticated.Store) => state.subAccountUnits.data,
  (state: Modules.Unauthenticated.Store) => state.subAccountUnits.data
);
