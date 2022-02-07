import { redux } from "lib";

export const requestAction = redux.actions.createAction<number>("budget.analysis.Request");
export const loadingAction = redux.actions.createAction<boolean>("budget.analysis.Loading");
export const responseAction = redux.actions.createAction<{
  readonly groups: Http.ListResponse<Model.Group>;
  readonly accounts: Http.ListResponse<Model.Account>;
  readonly actuals: Http.ListResponse<Model.Actual>;
}>("budget.analysis.Response");
