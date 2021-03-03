import { createAction } from "store/actions";

export const ActionDomains: { [key: string]: Redux.Dashboard.ActionDomain } = {
  TRASH: "trash",
  ACTIVE: "active"
};

export const ActionType = {
  Budgets: {
    Loading: "dashboard.budgets.Loading",
    Response: "dashboard.budgets.Response",
    Request: "dashboard.budgets.Request",
    Select: "dashboard.budgets.Select",
    SetSearch: "dashboard.budgets.SetSearch",
    SetPage: "dashboard.budgets.SetPage",
    SetPageSize: "dashboard.budgets.SetPageSize",
    SetPageAndSize: "dashboard.budgets.SetPageAndSize",
    UpdateInState: "dashboard.budgets.UpdateInState",
    RemoveFromState: "dashboard.budgets.RemoveFromState",
    AddToState: "dashboard.budgets.AddToState"
  }
};

export const simpleDomainAction = <P = any>(type: string) => {
  return (
    domain: Redux.Dashboard.ActionDomain,
    payload: P,
    options?: Redux.IActionConfig
  ): Redux.Dashboard.IAction<P> => {
    return { ...createAction<P>(type, payload, options), domain };
  };
};

export const requestBudgetsAction = (domain: Redux.Dashboard.ActionDomain): Redux.Dashboard.IAction<null> => {
  return { ...createAction(ActionType.Budgets.Request), domain };
};
export const loadingBudgetsAction = simpleDomainAction<boolean>(ActionType.Budgets.Loading);
export const responseBudgetsAction = simpleDomainAction<Http.IListResponse<IBudget>>(ActionType.Budgets.Response);
export const selectBudgetsAction = simpleDomainAction<number[]>(ActionType.Budgets.Select);
export const setBudgetsSearchAction = simpleDomainAction<string>(ActionType.Budgets.SetSearch);
export const setBudgetsPageAction = simpleDomainAction<number>(ActionType.Budgets.SetPage);
export const setBudgetsPageSizeAction = simpleDomainAction<number>(ActionType.Budgets.SetPageSize);
export const setBudgetsPageAndSizeAction = simpleDomainAction<PageAndSize>(ActionType.Budgets.SetPageAndSize);
export const updateBudgetInStateAction = simpleDomainAction<IBudget>(ActionType.Budgets.UpdateInState);
export const addBudgetToStateAction = simpleDomainAction<IBudget>(ActionType.Budgets.AddToState);
export const removeBudgetFromStateAction = simpleDomainAction<number>(ActionType.Budgets.RemoveFromState);
