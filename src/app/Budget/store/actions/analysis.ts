import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export const requestAction = createAction<null>(ActionType.Analysis.Request);
export const loadingAction = createAction<boolean>(ActionType.Analysis.Loading);
export const responseAction = createAction<{
  readonly groups: Http.ListResponse<Model.Group>;
  readonly accounts: Http.ListResponse<Model.Account>;
  readonly actuals: Http.ListResponse<Model.Actual>;
}>(ActionType.Analysis.Response);
