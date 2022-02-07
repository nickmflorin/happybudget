import { redux } from "lib";

export const handleTableChangeEventAction = redux.actions.createContextAction<
  Table.ChangeEvent<Tables.AccountRowData, Model.Account>,
  Tables.AccountTableContext
>("template.TableChanged");

export const requestAction = redux.actions.createContextAction<Redux.TableRequestPayload, Tables.AccountTableContext>(
  "template.TableRequest"
);
export const loadingAction = redux.actions.createAction<boolean>("template.TableLoading");
export const responseAction = redux.actions.createAction<Http.TableResponse<Model.Account>>("template.TableResponse");
export const setSearchAction = redux.actions.createContextAction<string, Tables.AccountTableContext>(
  "template.SetTableSearch"
);
export const addModelsToStateAction =
  redux.actions.createAction<Redux.AddModelsToTablePayload<Model.Account>>("template.AddModelsToState");
