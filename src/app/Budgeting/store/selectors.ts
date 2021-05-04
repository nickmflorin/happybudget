import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

export const selectBudgetId = (state: Redux.ApplicationStore) => state.budgeting.budget.budget.id;
export const selectBudgetDetail = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.budget.detail.data
);
export const selectBudgetDetailLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.budget.detail.loading
);
export const selectBudgetInstance = (state: Redux.ApplicationStore) => state.budgeting.budget.instance;
export const selectCommentsHistoryDrawerOpen = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.commentsHistoryDrawerOpen
);
export const selectBudgetFringes = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.fringes.data
);
export const selectTemplateId = (state: Redux.ApplicationStore) => state.budgeting.template.template.id;
export const selectTemplateDetail = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.template.detail.data
);
export const selectTemplateDetailLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.template.detail.loading
);
export const selectTemplateInstance = (state: Redux.ApplicationStore) => state.budgeting.template.instance;
export const selectTemplateFringes = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.template.fringes.data
);
export const selectFringeColors = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.fringeColors.data
);
export const selectFringeColorsLoading = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.fringeColors.loading
);
