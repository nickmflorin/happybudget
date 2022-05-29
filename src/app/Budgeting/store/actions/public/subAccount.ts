import { redux } from "lib";

type C = SubAccountActionContext<Model.Budget, true>;
type TC = SubAccountsTableActionContext<Model.Budget, Model.Account | Model.SubAccount, true>;

const creator = redux.actions.createActionCreator({ label: "public.subaccount" });

export const requestSubAccountAction = creator<Redux.RequestPayload, C>("Request");
// Currently, this action is not wired to anything but may be in the future.
export const loadingSubAccountAction = creator<boolean, C>("Loading");
export const responseSubAccountAction = creator<Http.RenderedDetailResponse<Model.SubAccount>, C>("Response");
export const loadingAction = creator<boolean, TC>("TableLoading");
export const requestAction = creator<Redux.TableRequestPayload, TC>("TableRequest");
export const responseAction = creator<Http.TableResponse<Model.SubAccount>, TC>("TableResponse");
export const setSearchAction = creator<string, TC>("SetTableSearch");
