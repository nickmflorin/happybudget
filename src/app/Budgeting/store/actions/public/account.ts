import { redux } from "lib";

export const requestAccountAction = redux.actions.createAction<number>("public.account.Request");
export const loadingAccountAction = redux.actions.createAction<boolean>("public.account.Loading");
export const responseAccountAction = redux.actions.createAction<Model.Account | null>("public.account.Response");

export const loadingAction = redux.actions.createAction<boolean>("public.account.TableLoading");

export const requestAction = redux.actions.createTableAction<Redux.TableRequestPayload, Tables.SubAccountTableContext>(
  "public.account.TableRequest"
);

export const responseAction =
  redux.actions.createAction<Http.TableResponse<Model.SubAccount>>("public.account.TableResponse");

export const setSearchAction = redux.actions.createTableAction<string, Tables.SubAccountTableContext>(
  "public.account.SetTableSearch"
);
