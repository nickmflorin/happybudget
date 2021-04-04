import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

export const selectBudgetId = (state: Redux.IApplicationStore) => state.budget.budget.id;
export const selectBudgetDetail = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.budget.detail.data
);
export const selectBudgetDetailLoading = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.budget.detail.loading
);
export const selectInstance = (state: Redux.IApplicationStore) => state.budget.instance;

export const selectCommentsHistoryDrawerOpen = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.commentsHistoryDrawerOpen
);

export const selectFringes = (state: Redux.IApplicationStore) => state.budget.fringes.data;
