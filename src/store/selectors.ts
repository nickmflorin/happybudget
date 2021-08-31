import { redux } from "lib";

export const selectApplicationLoading = (state: Modules.StoreObj) => state.loading;

export const selectContacts = redux.selectors.createGlobalSelector(
  redux.selectors.simpleDeepEqualSelector((state: Modules.Authenticated.StoreObj) => state.user.contacts.data),
  redux.selectors.simpleDeepEqualSelector((state: Modules.Unauthenticated.StoreObj) => state.contacts.data)
);

export const selectContactsLoading = redux.selectors.createGlobalSelector(
  (state: Modules.Authenticated.StoreObj) => state.user.contacts.loading,
  (state: Modules.Unauthenticated.StoreObj) => state.contacts.loading
);

export const selectContactsSearch = redux.selectors.createGlobalSelector(
  (state: Modules.Authenticated.StoreObj) => state.user.contacts.search,
  (state: Modules.Unauthenticated.StoreObj) => state.contacts.search
);

export const selectSubAccountUnitsLoading = redux.selectors.createGlobalSelector(
  (state: Modules.Authenticated.StoreObj) => state.subAccountUnits.loading,
  (state: Modules.Unauthenticated.StoreObj) => state.subAccountUnits.loading
);

export const selectSubAccountUnits = redux.selectors.createGlobalSelector(
  (state: Modules.Authenticated.StoreObj) => state.subAccountUnits.data,
  (state: Modules.Unauthenticated.StoreObj) => state.subAccountUnits.data
);
