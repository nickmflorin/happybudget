import { redux } from "lib";

type TC = ActualsTableActionContext;

const creator = redux.actions.createActionCreator({ label: "budget" });

export const responseActualOwnersAction = creator<Http.RenderedListResponse<Model.ActualOwner>, TC>(
  "actualowners.Response",
);
export const setActualOwnersSearchAction = creator<string, TC>("actualowners.SetSearch");
export const loadingActualOwnersAction = creator<boolean, TC>("actualowners.Loading");
export const handleTableEventAction = creator<Table.Event<Tables.ActualRowData, Model.Actual>, TC>(
  "actuals.TableChanged",
);
export const requestAction = creator<Redux.TableRequestPayload, TC>("actuals.Request");
export const loadingAction = creator<boolean, TC>("actuals.Loading");
export const responseAction = creator<Http.TableResponse<Model.Actual>, TC>("actuals.Response");
export const setSearchAction = creator<string, TC>("actuals.SetSearch");
