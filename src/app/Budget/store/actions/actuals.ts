import { redux } from "lib";

export const responseActualOwnersAction =
  redux.actions.createAction<Http.ListResponse<Model.ActualOwner>>("budget.actualowners.Response");
export const setActualOwnersSearchAction = redux.actions.createContextAction<string, Tables.ActualTableContext>(
  "budget.actualowners.SetSearch"
);
export const loadingActualOwnersAction = redux.actions.createAction<boolean>("budget.actualowners.Loading");

export const handleTableChangeEventAction = redux.actions.createContextAction<
  Table.ChangeEvent<Tables.ActualRowData, Model.Actual>,
  Tables.ActualTableContext
>("budget.actuals.TableChanged");

export const updateRowsInStateAction = redux.actions.createAction<Redux.UpdateRowsInTablePayload<Tables.ActualRowData>>(
  "budget.actuals.UpdateRowsInState"
);
export const requestAction = redux.actions.createContextAction<Redux.TableRequestPayload, Tables.ActualTableContext>(
  "budget.actuals.Request"
);
export const loadingAction = redux.actions.createAction<boolean>("budget.actuals.Loading");
export const responseAction = redux.actions.createAction<Http.TableResponse<Model.Actual>>("budget.actuals.Response");
export const setSearchAction = redux.actions.createContextAction<string, Tables.ActualTableContext>(
  "budget.actuals.SetSearch"
);
export const addModelsToStateAction = redux.actions.createAction<Redux.AddModelsToTablePayload<Model.Actual>>(
  "budget.actuals.AddModelsToState"
);
export const responseActualTypesAction =
  redux.actions.createAction<Http.ListResponse<Model.Tag>>("budget.actualstypes.Response");
