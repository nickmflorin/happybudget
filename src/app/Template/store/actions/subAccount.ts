import { redux } from "lib";

export const updateInStateAction = redux.actions.createAction<Redux.UpdateActionPayload<Model.SubAccount>>(
  "template.subaccount.UpdateInState"
);
export const requestSubAccountAction = redux.actions.createAction<number>("template.subaccount.Request");
export const loadingSubAccountAction = redux.actions.createAction<boolean>("template.subaccount.Loading");
export const responseSubAccountAction = redux.actions.createAction<Model.SubAccount | null>(
  "template.subaccount.Response"
);

export const handleTableChangeEventAction = redux.actions.createContextAction<
  Table.ChangeEvent<Tables.SubAccountRowData, Model.SubAccount>,
  Tables.SubAccountTableContext
>("template.subaccount.TableChanged");

export const loadingAction = redux.actions.createAction<boolean>("template.subaccount.TableLoading");

export const requestAction = redux.actions.createContextAction<
  Redux.TableRequestPayload,
  Tables.SubAccountTableContext
>("template.subaccount.TableRequest");

export const responseAction = redux.actions.createAction<Http.TableResponse<Model.SubAccount>>(
  "template.subaccount.TableResponse"
);
export const addModelsToStateAction = redux.actions.createAction<Redux.AddModelsToTablePayload<Model.SubAccount>>(
  "template.subaccount.AddModelsToState"
);
export const setSearchAction = redux.actions.createContextAction<string, Tables.SubAccountTableContext>(
  "template.subaccount.SetTableSearch"
);
