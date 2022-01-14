import { redux } from "lib";
import ActionType from "./ActionType";

export const responseActualOwnersAction = redux.actions.createAction<Http.ListResponse<Model.ActualOwner>>(
  ActionType.ActualOwners.Response
);
export const setActualOwnersSearchAction = redux.actions.createContextAction<string, Tables.ActualTableContext>(
  ActionType.ActualOwners.SetSearch
);
export const loadingActualOwnersAction = redux.actions.createAction<boolean>(ActionType.ActualOwners.Loading);

export const handleTableChangeEventAction = redux.actions.createContextAction<
  Table.ChangeEvent<Tables.ActualRowData, Model.Actual>,
  Tables.ActualTableContext
>(ActionType.Actuals.TableChanged);

export const updateRowsInStateAction = redux.actions.createAction<Redux.UpdateRowsInTablePayload<Tables.ActualRowData>>(
  ActionType.Actuals.UpdateRowsInState
);
export const requestAction = redux.actions.createContextAction<Redux.TableRequestPayload, Tables.ActualTableContext>(
  ActionType.Actuals.Request
);
export const loadingAction = redux.actions.createAction<boolean>(ActionType.Actuals.Loading);
export const responseAction = redux.actions.createAction<Http.TableResponse<Model.Actual>>(ActionType.Actuals.Response);
export const setSearchAction = redux.actions.createContextAction<string, Tables.ActualTableContext>(
  ActionType.Actuals.SetSearch
);
export const addModelsToStateAction = redux.actions.createAction<Redux.AddModelsToTablePayload<Model.Actual>>(
  ActionType.Actuals.AddToState
);
export const responseActualTypesAction = redux.actions.createAction<Http.ListResponse<Model.Tag>>(
  ActionType.ActualTypes.Response
);
