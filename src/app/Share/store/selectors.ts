import { redux } from "lib";

export const selectBudgetId = (state: Modules.Unauthenticated.Store) => state.share.budget.id;
export const selectBudgetDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Unauthenticated.Store) => state.share.budget.detail.data
);
export const selectBudgetDetailLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Unauthenticated.Store) => state.share.budget.detail.loading
);
