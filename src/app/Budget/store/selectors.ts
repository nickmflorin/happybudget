import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

export const selectBudgetId = (state: Redux.ApplicationStore) => state.budget.budget.id;
export const selectBudgetDetail = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.budget.detail.data
);
export const selectBudgetDetailLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.budget.detail.loading
);
export const selectInstance = (state: Redux.ApplicationStore) => state.budget.instance;

export const selectCommentsHistoryDrawerOpen = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.commentsHistoryDrawerOpen
);

export const selectFringes = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.budget.fringes.data);
