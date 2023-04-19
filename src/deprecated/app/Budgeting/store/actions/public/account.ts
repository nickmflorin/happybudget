import { redux } from "lib";

type C = AccountActionContext<Model.Budget, true>;
type TC = SubAccountsTableActionContext<Model.Budget, Model.Account, true>;

const creator = redux.actions.createActionCreator({ label: "public.account" });

export const requestAccountAction = creator<Redux.RequestPayload, C>("Request");
// Currently, this action is not wired to anything but may be in the future.
export const loadingAccountAction = creator<boolean, C>("Loading");
export const responseAccountAction = creator<Http.RenderedDetailResponse<Model.Account>, C>(
  "Response",
);
export const loadingAction = creator<boolean, TC>("TableLoading");
export const requestAction = creator<Redux.TableRequestPayload, TC>("TableRequest");
export const responseAction = creator<Http.TableResponse<Model.SubAccount>, TC>("TableResponse");
export const setSearchAction = creator<string, TC>("SetTableSearch");
