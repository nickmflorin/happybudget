import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export const handleTableChangeEventAction = createAction<Table.ChangeEvent<Tables.AccountRowData>>(
  ActionType.Accounts.TableChanged
);
export const savingTableAction = createAction<boolean>(ActionType.Accounts.Saving);
export const addModelsToStateAction = createAction<Redux.AddModelsToTablePayload<Model.Account>>(
  ActionType.Accounts.AddToState
);
export const clearAction = createAction<null>(ActionType.Accounts.Clear);
export const requestAction = createAction<null>(ActionType.Accounts.Request);
export const loadingAction = createAction<boolean>(ActionType.Accounts.Loading);
export const responseAction = createAction<Http.TableResponse<Model.Account>>(ActionType.Accounts.Response);
export const setSearchAction = createAction<string>(ActionType.Accounts.SetSearch);
export const addAccountToStateAction = createAction<Model.Account>(ActionType.Accounts.AddToState);
