import { createSelector } from "reselect";

import { redux, budgeting } from "lib";
import { initialSubAccountsTableState } from "./initialState";

export const selectTemplateId = (state: Application.Authenticated.Store) => state.template.id;
export const selectTemplateDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.template.detail.data
);
export const selectTemplateDetailLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Application.Authenticated.Store) => state.template.detail.loading
);

export const selectSubAccountsTableStore = redux.selectors.simpleDeepEqualSelector((store: Application.Store) => {
  if (redux.typeguards.isAuthenticatedStore(store)) {
    const path = store.router.location.pathname;
    if (budgeting.urls.isAccountUrl(path)) {
      return store.template.account.table;
    } else if (budgeting.urls.isSubAccountUrl(path)) {
      return store.template.subaccount.table;
    }
  }
  return initialSubAccountsTableState;
});

export const selectFringesStore = createSelector(
  selectSubAccountsTableStore,
  (state: Tables.SubAccountTableStore) => state.fringes
);

export const selectFringes = createSelector(selectFringesStore, (state: Tables.FringeTableStore) => state.data);

export const selectSubAccountUnits = createSelector(
  selectSubAccountsTableStore,
  (state: Tables.SubAccountTableStore) => state.subaccountUnits
);
