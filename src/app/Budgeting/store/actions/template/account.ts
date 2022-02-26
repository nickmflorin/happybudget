import { redux } from "lib";

export const updateInStateAction = redux.actions.createAction<Redux.UpdateActionPayload<Model.Account>>(
  "template.account.UpdateInState"
);
export const requestAccountAction = redux.actions.createAction<number>("template.account.Request");
export const loadingAccountAction = redux.actions.createAction<boolean>("template.account.Loading");
export const responseAccountAction = redux.actions.createAction<Model.Account | null>("template.account.Response");

export const handleTableEventAction = redux.actions.createTableAction<
  Table.Event<Tables.SubAccountRowData, Model.SubAccount>,
  Tables.SubAccountTableContext
>("template.account.TableChanged");

export const loadingAction = redux.actions.createAction<boolean>("template.account.TableLoading");

export const requestAction = redux.actions.createTableAction<Redux.TableRequestPayload, Tables.SubAccountTableContext>(
  "template.account.TableRequest"
);
export const responseAction = redux.actions.createAction<Http.TableResponse<Model.SubAccount>>(
  "template.account.TableResponse"
);
export const setSearchAction = redux.actions.createTableAction<string, Tables.SubAccountTableContext>(
  "template.account.SetTableSearch"
);
