import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export const updateInStateAction = createAction<Redux.UpdateActionPayload<Model.SubAccount>>(
  ActionType.SubAccount.UpdateInState
);
export const requestSubAccountAction = createAction<null>(ActionType.SubAccount.Request);
export const setSubAccountIdAction = createAction<number | null>(ActionType.SubAccount.SetId);
export const loadingSubAccountAction = createAction<boolean>(ActionType.SubAccount.Loading);
export const responseSubAccountAction = createAction<Model.SubAccount | null>(ActionType.SubAccount.Response);

export const handleTableChangeEventAction = createAction<Table.ChangeEvent<Tables.SubAccountRowData, Model.SubAccount>>(
  ActionType.SubAccount.SubAccounts.TableChanged
);
export const savingTableAction = createAction<boolean>(ActionType.SubAccount.SubAccounts.Saving);
export const loadingAction = createAction<boolean>(ActionType.SubAccount.SubAccounts.Loading);
export const requestAction = createAction<Redux.TableRequestPayload>(ActionType.SubAccount.SubAccounts.Request);
export const responseAction = createAction<Http.TableResponse<Model.SubAccount>>(
  ActionType.SubAccount.SubAccounts.Response
);
export const addModelsToStateAction = createAction<Redux.AddModelsToTablePayload<Model.SubAccount>>(
  ActionType.SubAccount.SubAccounts.AddToState
);
export const updateRowsInStateAction = createAction<Redux.UpdateRowsInTablePayload<Tables.SubAccountRowData>>(
  ActionType.SubAccount.SubAccounts.UpdateRowsInState
);
export const setSearchAction = createAction<string>(ActionType.SubAccount.SubAccounts.SetSearch);
