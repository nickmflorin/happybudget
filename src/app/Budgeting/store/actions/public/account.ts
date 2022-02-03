import { redux } from "lib";

export const requestAccountAction = redux.actions.createAction<number>("budget.account.Request");
export const loadingAccountAction = redux.actions.createAction<boolean>("budget.account.Loading");
export const responseAccountAction = redux.actions.createAction<Model.Account | null>("budget.account.Response");

export const loadingAction = redux.actions.createAction<boolean>("budget.account.TableLoading");

export const requestAction = redux.actions.createTableAction<
  Redux.TableRequestPayload,
  Tables.SubAccountTableContext
>("budget.account.TableRequest");

export const responseAction =
  redux.actions.createAction<Http.TableResponse<Model.SubAccount>>("budget.account.TableResponse");

export const setSearchAction = redux.actions.createTableAction<string, Tables.SubAccountTableContext>(
  "budget.account.SetTableSearch"
);
