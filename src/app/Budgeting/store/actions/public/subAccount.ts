import { redux } from "lib";

export const requestSubAccountAction = redux.actions.createAction<number>("public.subaccount.Request");
export const loadingSubAccountAction = redux.actions.createAction<boolean>("public.subaccount.Loading");
export const responseSubAccountAction = redux.actions.createAction<Model.SubAccount | null>(
  "public.subaccount.Response"
);
export const loadingAction = redux.actions.createAction<boolean>("public.subaccount.TableLoading");

export const requestAction = redux.actions.createTableAction<Redux.TableRequestPayload, Tables.SubAccountTableContext>(
  "public.subaccount.TableRequest"
);

export const responseAction = redux.actions.createAction<Http.TableResponse<Model.SubAccount>>(
  "public.subaccount.TableResponse"
);
export const setSearchAction = redux.actions.createTableAction<string, Tables.SubAccountTableContext>(
  "public.subaccount.SetTableSearch"
);
