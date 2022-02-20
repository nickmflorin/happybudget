import { redux } from "lib";

export const updateInStateAction = redux.actions.createAction<Redux.UpdateActionPayload<Model.SubAccount>>(
  "budget.subaccount.UpdateInState"
);
export const requestSubAccountAction = redux.actions.createAction<number>("budget.subaccount.Request");
export const loadingSubAccountAction = redux.actions.createAction<boolean>("budget.subaccount.Loading");
export const responseSubAccountAction = redux.actions.createAction<Model.SubAccount | null>(
  "budget.subaccount.Response"
);
export const handleTableChangeEventAction = redux.actions.createTableAction<
  Table.ChangeEvent<Tables.SubAccountRowData, Model.SubAccount>,
  Tables.SubAccountTableContext
>("budget.subaccount.TableChanged");

export const loadingAction = redux.actions.createAction<boolean>("budget.subaccount.TableLoading");

export const requestAction = redux.actions.createTableAction<Redux.TableRequestPayload, Tables.SubAccountTableContext>(
  "budget.subaccount.TableRequest"
);
export const responseAction = redux.actions.createAction<Http.TableResponse<Model.SubAccount>>(
  "budget.subaccount.TableResponse"
);
export const setSearchAction = redux.actions.createTableAction<string, Tables.SubAccountTableContext>(
  "budget.subaccount.SetTableSearch"
);
