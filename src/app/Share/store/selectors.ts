import { redux } from "lib";

export const selectBudgetDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Unauthenticated.Store) => state.share.detail.data
);
export const selectBudgetDetailLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Application.Unauthenticated.Store) => state.share.detail.loading
);
