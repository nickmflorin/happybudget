import { redux } from "lib";

export * as account from "./account";
export * as accounts from "./accounts";
export * as subAccount from "./subAccount";

export const loadingBudgetAction = redux.actions.createAction<boolean>("public.Loading");
export const responseBudgetAction = redux.actions.createAction<Model.Budget | null>("public.Response");
export const requestBudgetAction = redux.actions.createAction<number>("public.Request");

export const loadingFringesAction = redux.actions.createAction<boolean>("public.fringes.Loading");
export const requestFringesAction = redux.actions.createTableAction<
  Redux.TableRequestPayload,
  Tables.FringeTableContext
>("public.fringes.Request");
export const responseFringesAction =
  redux.actions.createAction<Http.TableResponse<Model.Fringe>>("public.fringes.Response");
export const setFringesSearchAction = redux.actions.createTableAction<string, Tables.FringeTableContext>(
  "public.fringes.SetSearch"
);
export const responseSubAccountUnitsAction = redux.actions.createAction<Http.ListResponse<Model.Tag>>(
  "public.subaccountunits.Response"
);
export const responseFringeColorsAction =
  redux.actions.createAction<Http.ListResponse<string>>("public.fringecolors.Response");
