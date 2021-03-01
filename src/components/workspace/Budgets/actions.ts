import { simpleAction } from "store/actions";

export const ActionType = {
  Budgets: {
    Loading: "budgets.budgets.Loading",
    Response: "budgets.budgets.Response",
    Request: "budgets.budgets.Request",
    Select: "budgets.budgets.Select",
    SetSearch: "budgets.budgets.SetSearch",
    SetPage: "budgets.budgets.SetPage",
    SetPageSize: "budgets.budgets.SetPageSize",
    SetPageAndSize: "budgets.budgets.SetPageAndSize",
    UpdateInState: "budgets.budgets.UpdateInState",
    RemoveFromState: "budgets.budgets.RemoveFromState",
    AddToState: "budgets.budgets.AddToState"
  }
};

export const requestBudgetsAction = simpleAction<null>(ActionType.Budgets.Request);
export const loadingBudgetsAction = simpleAction<boolean>(ActionType.Budgets.Loading);
export const responseBudgetsAction = simpleAction<Http.IListResponse<IBudget>>(ActionType.Budgets.Response);
export const selectBudgetsAction = simpleAction<number[]>(ActionType.Budgets.Select);
export const setBudgetsSearchAction = simpleAction<string>(ActionType.Budgets.SetSearch);
export const setBudgetsPageAction = simpleAction<number>(ActionType.Budgets.SetPage);
export const setBudgetsPageSizeAction = simpleAction<number>(ActionType.Budgets.SetPageSize);
export const setBudgetsPageAndSizeAction = simpleAction<PageAndSize>(ActionType.Budgets.SetPageAndSize);
export const updateBudgetInStateAction = simpleAction<IBudget>(ActionType.Budgets.UpdateInState);
export const addBudgetToStateAction = simpleAction<IBudget>(ActionType.Budgets.AddToState);
export const removeBudgetFromStateAction = simpleAction<number>(ActionType.Budgets.RemoveFromState);
