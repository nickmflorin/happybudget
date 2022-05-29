import { redux } from "lib";

const creator = redux.actions.createActionCreator({ label: "budget" });

export const requestAction = creator<Redux.RequestPayload, Redux.WithActionContext<{ readonly budgetId: number }>>(
  "analysis.Request"
);
export const loadingAction = creator<boolean>("analysis.Loading");
export const responseAction = creator<{
  readonly groups: Http.ListResponse<Model.Group>;
  readonly accounts: Http.ListResponse<Model.Account>;
  readonly actuals: Http.ListResponse<Model.Actual>;
}>("analysis.Response");
