import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export const responseActualOwnersAction = createAction<Http.ListResponse<Model.ActualOwner>>(
  ActionType.ActualOwners.Response
);
export const setActualOwnersSearchAction = createAction<string>(ActionType.ActualOwners.SetSearch);
export const loadingActualOwnersAction = createAction<boolean>(ActionType.ActualOwners.Loading);

export const handleTableChangeEventAction = createAction<Table.ChangeEvent<Tables.ActualRowData, Model.Actual>>(
  ActionType.Actuals.TableChanged
);
export const updateRowsInStateAction = createAction<Redux.UpdateRowsInTablePayload<Tables.ActualRowData>>(
  ActionType.Actuals.UpdateRowsInState
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
