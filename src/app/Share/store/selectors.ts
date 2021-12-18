import { redux } from "lib";

export const selectBudgetDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.UnauthenticatedStore) => state.share.detail.data
);
export const selectBudgetDetailLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Application.UnauthenticatedStore) => state.share.detail.loading
);
