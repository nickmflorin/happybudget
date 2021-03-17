import { simpleAction } from "store/actions";

export const ActionType = {
  SetAncestors: "budget.SetAncestors",
  SetAncestorsLoading: "budget.SetAncestorsLoading",
  SetCommentsHistoryDrawerVisibility: "SetCommentsHistoryDrawerVisibility",
  Budget: {
    SetId: "budget.budget.SetId",
    Loading: "budget.budget.Loading",
    Response: "budget.budget.Response",
    Request: "budget.budget.Request"
  }
};

export const setBudgetIdAction = simpleAction<number>(ActionType.Budget.SetId);
export const setAncestorsAction = simpleAction<IAncestor[]>(ActionType.SetAncestors);
export const setAncestorsLoadingAction = simpleAction<boolean>(ActionType.SetAncestorsLoading);
export const requestBudgetAction = simpleAction<null>(ActionType.Budget.Request);
export const loadingBudgetAction = simpleAction<boolean>(ActionType.Budget.Loading);
export const responseBudgetAction = simpleAction<IBudget>(ActionType.Budget.Response);
export const setCommentsHistoryDrawerVisibilityAction = simpleAction<boolean>(
  ActionType.SetCommentsHistoryDrawerVisibility
);
