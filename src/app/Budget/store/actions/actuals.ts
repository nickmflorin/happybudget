import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export const responseOwnerTreeAction = createAction<Http.ListResponse<Model.OwnerTreeNode>>(
  ActionType.OwnerTree.Response
);
export const restoreOwnerTreeSearchCacheAction = createAction<null>(ActionType.OwnerTree.RestoreSearchCache);
export const setOwnerTreeSearchAction = createAction<string>(ActionType.OwnerTree.SetSearch);
export const loadingOwnerTreeAction = createAction<boolean>(ActionType.OwnerTree.Loading);

export const handleTableChangeEventAction = createAction<Table.ChangeEvent<Tables.ActualRowData, Model.Actual>>(
  ActionType.Actuals.TableChanged
);
export const savingTableAction = createAction<boolean>(ActionType.Actuals.Saving);
export const requestAction = createAction<Redux.TableRequestPayload>(ActionType.Actuals.Request);
export const clearAction = createAction<null>(ActionType.Actuals.Clear);
export const loadingAction = createAction<boolean>(ActionType.Actuals.Loading);
export const responseAction = createAction<Http.TableResponse<Model.Actual>>(ActionType.Actuals.Response);
export const setSearchAction = createAction<string>(ActionType.Actuals.SetSearch);
export const addModelsToStateAction = createAction<Redux.AddModelsToTablePayload<Model.Actual>>(
  ActionType.Actuals.AddToState
);
export const responseActualTypesAction = createAction<Http.ListResponse<Model.Tag>>(ActionType.ActualTypes.Response);
