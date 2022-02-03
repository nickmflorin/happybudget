import { redux } from "lib";

export * as account from "./account";
export * as accounts from "./accounts";
export * as subAccount from "./subAccount";

export const loadingBudgetAction = redux.actions.createAction<boolean>("budget.Loading");
export const responseBudgetAction = redux.actions.createAction<Model.Budget | null>("budget.Response");
export const requestBudgetAction = redux.actions.createAction<number>("budget.Request");

export const loadingFringesAction = redux.actions.createAction<boolean>("budget.fringes.Loading");
export const requestFringesAction = redux.actions.createTableAction<
  Redux.TableRequestPayload,
  Tables.FringeTableContext
>("budget.fringes.Request");
export const responseFringesAction =
  redux.actions.createAction<Http.TableResponse<Model.Fringe>>("budget.fringes.Response");
export const setFringesSearchAction = redux.actions.createTableAction<string, Tables.FringeTableContext>(
  "budget.fringes.SetSearch"
);
export const responseSubAccountUnitsAction = redux.actions.createAction<Http.ListResponse<Model.Tag>>(
  "budget.subaccountunits.Response"
);
export const responseFringeColorsAction =
  redux.actions.createAction<Http.ListResponse<string>>("budget.fringecolors.Response");
