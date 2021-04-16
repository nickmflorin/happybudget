import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

export const selectBudgetId = (state: Redux.ApplicationStore) => state.budget.budget.id;
export const selectBudgetDetail = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.budget.detail.data
);
export const selectBudgetDetailLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.budget.detail.loading
);
export const selectBudgetInstance = (state: Redux.ApplicationStore) => state.budget.instance;
export const selectCommentsHistoryDrawerOpen = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.commentsHistoryDrawerOpen
);
export const selectBudgetFringes = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.fringes.data
);
export const selectTemplateId = (state: Redux.ApplicationStore) => state.template.template.id;
export const selectTemplateDetail = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.template.template.detail.data
);
export const selectTemplateDetailLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.template.template.detail.loading
);
export const selectTemplateInstance = (state: Redux.ApplicationStore) => state.template.instance;
export const selectTemplateFringes = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.template.fringes.data
);
