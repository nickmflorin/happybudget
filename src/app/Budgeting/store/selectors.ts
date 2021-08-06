import { redux } from "lib";

export const selectBudgetId = (state: Modules.ApplicationStore) => state.budget.budget.budget.id;
export const selectBudgetDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.detail.data
);
export const selectBudgetDetailLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.detail.loading
);
export const selectCommentsHistoryDrawerOpen = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.commentsHistoryDrawerOpen
);
export const selectTemplateId = (state: Modules.ApplicationStore) => state.budget.template.budget.id;
export const selectTemplateDetail = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.budget.detail.data
);
export const selectTemplateDetailLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.budget.detail.loading
);
export const selectFringeColors = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.fringeColors.data
);
export const selectFringeColorsLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.fringeColors.loading
);
export const selectSubAccountUnits = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.subaccountUnits.data
);
export const selectSubAccountUnitsLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.subaccountUnits.loading
);
