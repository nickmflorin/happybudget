import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

export const selectBudgetId = (state: Modules.ApplicationStore) => state.budgeting.budget.budget.id;
export const selectBudgetDetail = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.budget.detail.data
);
export const selectBudgetDetailLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.budget.detail.loading
);
export const selectCommentsHistoryDrawerOpen = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.commentsHistoryDrawerOpen
);
export const selectBudgetFringes = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.fringes.data
);
export const selectTemplateId = (state: Modules.ApplicationStore) => state.budgeting.template.template.id;
export const selectTemplateDetail = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.template.detail.data
);
export const selectTemplateDetailLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.template.detail.loading
);
export const selectTemplateFringes = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.template.fringes.data
);
export const selectFringeColors = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.fringeColors.data
);
export const selectFringeColorsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.fringeColors.loading
);
export const selectSubAccountUnits = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.subaccountUnits.data
);
export const selectSubAccountUnitsLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.subaccountUnits.loading
);
