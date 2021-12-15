import { redux } from "lib";
import ActionType from "./ActionType";

export const requestAction = redux.actions.createAction<number>(ActionType.Analysis.Request);
export const loadingAction = redux.actions.createAction<boolean>(ActionType.Analysis.Loading);
export const responseAction = redux.actions.createAction<{
  readonly groups: Http.ListResponse<Model.Group>;
  readonly accounts: Http.ListResponse<Model.Account>;
  readonly actuals: Http.ListResponse<Model.Actual>;
}>(ActionType.Analysis.Response);
