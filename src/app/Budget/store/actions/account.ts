import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export const updateInStateAction = createAction<Redux.UpdateActionPayload<Model.Account>>(
  ActionType.Account.UpdateInState
);
export const setAccountIdAction = createAction<number | null>(ActionType.Account.SetId);
export const requestAccountAction = createAction<null>(ActionType.Account.Request);
export const loadingAccountAction = createAction<boolean>(ActionType.Account.Loading);
export const responseAccountAction = createAction<Model.Account | null>(ActionType.Account.Response);

export const handleTableChangeEventAction = createAction<Table.ChangeEvent<Tables.SubAccountRowData, Model.SubAccount>>(
  ActionType.Account.SubAccounts.TableChanged
);
export const savingTableAction = createAction<boolean>(ActionType.Account.SubAccounts.Saving);
export const clearAction = createAction<null>(ActionType.Account.SubAccounts.Clear);
export const loadingAction = createAction<boolean>(ActionType.Account.SubAccounts.Loading);
export const requestAction = createAction<Redux.TableRequestPayload>(ActionType.Account.SubAccounts.Request);
export const responseAction = createAction<Http.TableResponse<Model.SubAccount>>(
  ActionType.Account.SubAccounts.Response
);
export const addModelsToStateAction = createAction<Redux.AddModelsToTablePayload<Model.SubAccount>>(
  ActionType.Account.SubAccounts.AddToState
);
export const updateRowsInStateAction = createAction<Redux.UpdateRowsInTablePayload<Tables.SubAccountRowData>>(
  ActionType.Account.SubAccounts.UpdateRowsInState
);
export const setSearchAction = createAction<string>(ActionType.Account.SubAccounts.SetSearch);
