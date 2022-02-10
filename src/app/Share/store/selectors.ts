import { redux } from "lib";

export const selectBudgetDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Application.PublicStore) => state.share.detail.data
);
export const selectBudgetDetailLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Application.PublicStore) => state.share.detail.loading
);
