import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export const responseSubAccountsTreeAction = createAction<Http.ListResponse<Model.SubAccountTreeNode>>(
  ActionType.SubAccountsTree.Response
);
export const restoreSubAccountsTreeSearchCacheAction = createAction<null>(
  ActionType.SubAccountsTree.RestoreSearchCache
);
export const setSubAccountsTreeSearchAction = createAction<string>(ActionType.SubAccountsTree.SetSearch);
export const loadingSubAccountsTreeAction = createAction<boolean>(ActionType.SubAccountsTree.Loading);

export const handleTableChangeEventAction = createAction<Table.ChangeEvent<Tables.ActualRowData>>(
  ActionType.Actuals.TableChanged
);
export const savingTableAction = createAction<boolean>(ActionType.Actuals.Saving);
export const requestAction = createAction<null>(ActionType.Actuals.Request);
export const clearAction = createAction<null>(ActionType.Actuals.Clear);
export const loadingAction = createAction<boolean>(ActionType.Actuals.Loading);
export const responseAction = createAction<Http.TableResponse<Model.Actual>>(ActionType.Actuals.Response);
export const setSearchAction = createAction<string>(ActionType.Actuals.SetSearch);
export const addModelsToStateAction = createAction<Redux.AddModelsToTablePayload<Model.Actual>>(
  ActionType.Actuals.AddToState
);
