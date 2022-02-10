import { createSelector } from "reselect";

import { redux } from "lib";
import { initialSubAccountsTableState } from "./initialState";

const getState = (s: Application.Store) => s;
const getParentType = (_: unknown, p: "account" | "subaccount") => p;

export const selectBudgetDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.AuthenticatedStore) => state.budget.detail.data
);
export const selectBudgetDetailLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Application.AuthenticatedStore) => state.budget.detail.loading
);

export const selectAccountsTableStore = redux.selectors.simpleDeepEqualSelector((store: Application.Store) => {
  if (redux.typeguards.isAuthenticatedStore(store)) {
    return store.budget.accounts;
  }
  return redux.initialState.initialTableState;
});

export const selectSubAccountsTableStore = createSelector(
  getState,
  getParentType,
  (s: Application.Store, parentType: "account" | "subaccount") => {
    if (redux.typeguards.isAuthenticatedStore(s)) {
      return s.budget[parentType].table;
    }
    return initialSubAccountsTableState;
  }
);

export const selectFringesStore = createSelector(
  selectSubAccountsTableStore,
  (state: Tables.SubAccountTableStore) => state.fringes
);

export const selectFringes = createSelector(selectFringesStore, (state: Tables.FringeTableStore) => state.data);

export const selectSubAccountUnits = createSelector(
  selectSubAccountsTableStore,
  (state: Tables.SubAccountTableStore) => state.subaccountUnits
);
