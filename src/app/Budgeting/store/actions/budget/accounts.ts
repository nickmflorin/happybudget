import { redux } from "lib";

export const handleTableChangeEventAction = redux.actions.createTableAction<
  Table.ChangeEvent<Tables.AccountRowData, Model.Account>,
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
export const addModelsToStateAction =
  redux.actions.createAction<Redux.AddModelsToTablePayload<Model.Account>>("budget.AddModelsToState");
