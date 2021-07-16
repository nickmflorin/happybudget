import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

export const selectBudgetId = (state: Modules.ApplicationStore) => state.budget.budget.budget.id;
export const selectBudgetDetail = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.detail.data
);
export const selectBudgetDetailLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.detail.loading
);
export const selectCommentsHistoryDrawerOpen = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.commentsHistoryDrawerOpen
);
export const selectTemplateId = (state: Modules.ApplicationStore) => state.budget.template.budget.id;
export const selectTemplateDetail = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.budget.detail.data
);
export const selectTemplateDetailLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.template.budget.detail.loading
);
export const selectFringeColors = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.fringeColors.data
);
export const selectFringeColorsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.fringeColors.loading
);
export const selectSubAccountUnits = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.subaccountUnits.data
);
export const selectSubAccountUnitsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.subaccountUnits.loading
);
