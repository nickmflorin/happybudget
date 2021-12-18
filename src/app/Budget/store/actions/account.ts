import { redux } from "lib";
import ActionType from "./ActionType";

export const updateInStateAction = redux.actions.createAction<Redux.UpdateActionPayload<Model.Account>>(
  ActionType.Account.UpdateInState
);
export const requestAccountAction = redux.actions.createAction<number>(ActionType.Account.Request);
export const loadingAccountAction = redux.actions.createAction<boolean>(ActionType.Account.Loading);
export const responseAccountAction = redux.actions.createAction<Model.Account | null>(ActionType.Account.Response);

export const handleTableChangeEventAction = redux.actions.createContextAction<
  Table.ChangeEvent<Tables.SubAccountRowData, Model.SubAccount>,
  Tables.SubAccountTableContext
>(ActionType.Account.SubAccounts.TableChanged);

export const savingTableAction = redux.actions.createAction<boolean>(ActionType.Account.SubAccounts.Saving);
export const loadingAction = redux.actions.createAction<boolean>(ActionType.Account.SubAccounts.Loading);

export const requestAction = redux.actions.createContextAction<
  Redux.TableRequestPayload,
  Tables.SubAccountTableContext
>(ActionType.Account.SubAccounts.Request);

export const responseAction = redux.actions.createAction<Http.TableResponse<Model.SubAccount>>(
  ActionType.Account.SubAccounts.Response
);

export const addModelsToStateAction = redux.actions.createAction<Redux.AddModelsToTablePayload<Model.SubAccount>>(
  ActionType.Account.SubAccounts.AddToState
);

export const updateRowsInStateAction = redux.actions.createAction<
  Redux.UpdateRowsInTablePayload<Tables.SubAccountRowData>
>(ActionType.Account.SubAccounts.UpdateRowsInState);

export const setSearchAction = redux.actions.createContextAction<string, Tables.SubAccountTableContext>(
  ActionType.Account.SubAccounts.SetSearch
);
