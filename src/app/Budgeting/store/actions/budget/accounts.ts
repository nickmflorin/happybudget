import { redux } from "lib";

export const handleTableEventAction = redux.actions.createTableAction<
  Table.Event<Tables.AccountRowData, Model.Account>,
  Tables.AccountTableContext
>("budget.TableChanged");

export const requestAction = redux.actions.createTableAction<Redux.TableRequestPayload, Tables.AccountTableContext>(
  "budget.TableRequest"
);
export const loadingAction = redux.actions.createAction<boolean>("budget.TableLoading");
export const responseAction = redux.actions.createAction<Http.TableResponse<Model.Account>>("budget.TableResponse");
export const setSearchAction = redux.actions.createTableAction<string, Tables.AccountTableContext>(
  "budget.SetTableSearch"
);
