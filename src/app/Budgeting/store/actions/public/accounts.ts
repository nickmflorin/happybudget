import { redux } from "lib";

export const requestAction = redux.actions.createTableAction<Redux.TableRequestPayload, Tables.AccountTableContext>(
  "public.TableRequest"
);
export const loadingAction = redux.actions.createAction<boolean>("public.TableLoading");
export const responseAction = redux.actions.createAction<Http.TableResponse<Model.Account>>("public.TableResponse");
export const setSearchAction = redux.actions.createTableAction<string, Tables.AccountTableContext>(
  "public.SetTableSearch"
);
