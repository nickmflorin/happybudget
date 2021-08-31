import { redux } from "lib";

export const selectBudgetId = (state: Modules.Unauthenticated.StoreObj) => state.share.budget.id;
export const selectBudgetDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Unauthenticated.StoreObj) => state.share.budget.detail.data
);
export const selectBudgetDetailLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Unauthenticated.StoreObj) => state.share.budget.detail.loading
);
