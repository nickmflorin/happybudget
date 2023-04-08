import { redux } from "lib";

const creator = redux.actions.createActionCreator({ label: "budget" });

export const requestAction = creator<
  Redux.RequestPayload,
  Redux.WithActionContext<{ readonly budgetId: number }>
>("analysis.Request");
export const loadingAction = creator<boolean>("analysis.Loading");
export const responseAction = creator<{
  readonly groups: Http.ApiListResponse<Model.Group>;
  readonly accounts: Http.ApiListResponse<Model.Account>;
  readonly actuals: Http.ApiListResponse<Model.Actual>;
}>("analysis.Response");
