import { createAction } from "@reduxjs/toolkit";
import ActionType from "./ActionType";

export const requestAction = createAction<null>(ActionType.Analysis.Request);
export const loadingAction = createAction<boolean>(ActionType.Analysis.Loading);
export const responseAction = createAction<{
  groups: Http.ListResponse<Model.Group>;
  accounts: Http.ListResponse<Model.Account>;
}>(ActionType.Analysis.Response);
