import { redux } from "lib";

export const selectBudgetId = (state: Modules.Authenticated.Store) => state.budget.budget.budget.id;
export const selectBudgetDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.budget.detail.data
);
export const selectBudgetDetailLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.budget.detail.loading
);
export const selectCommentsHistoryDrawerOpen = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.commentsHistoryDrawerOpen
);
export const selectTemplateId = (state: Modules.Authenticated.Store) => state.budget.template.budget.id;
export const selectTemplateDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.template.budget.detail.data
);
export const selectTemplateDetailLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.template.budget.detail.loading
);
export const selectFringeColors = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.fringeColors.data
);
export const selectFringeColorsLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.fringeColors.loading
);
