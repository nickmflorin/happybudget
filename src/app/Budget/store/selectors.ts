import { redux } from "lib";

export const selectBudgetId = (state: Application.Authenticated.Store) => state.budget.id;
export const selectBudgetDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.detail.data
);
export const selectBudgetDetailLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.detail.loading
);
