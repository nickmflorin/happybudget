import { redux } from "lib";

export * as account from "./account";
export * as subAccount from "./subAccount";

type FC = FringesTableActionContext<Model.Budget, Model.Account | Model.SubAccount, true>;
type C = BudgetActionContext<Model.Budget, true>;
type TC = AccountsTableActionContext<Model.Budget, true>;

const creator = redux.actions.createActionCreator({ label: "public" });

export const requestAction = creator<Redux.TableRequestPayload, TC>("TableRequest");
export const loadingAction = creator<boolean, TC>("TableLoading");
export const responseAction = creator<Http.TableResponse<Model.Account>, TC>("TableResponse");
export const setSearchAction = creator<string, TC>("SetTableSearch");

export const loadingBudgetAction = creator<boolean, C>("Loading");
export const responseBudgetAction = creator<Http.RenderedDetailResponse<Model.Budget>>("Response");
export const requestBudgetAction = creator<Redux.RequestPayload, C>("Request");

export const loadingFringesAction = creator<boolean, FC>("fringes.Loading");
export const responseFringesAction = creator<Http.TableResponse<Model.Fringe>, FC>(
  "fringes.Response",
);
export const setFringesSearchAction = creator<string, FC>("fringes.SetSearch");
