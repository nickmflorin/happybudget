import { redux } from "lib";

type C = SubAccountActionContext<Model.Budget, false>;
type TC = SubAccountsTableActionContext<Model.Budget, Model.Account | Model.SubAccount, false>;

const creator = redux.actions.createActionCreator({ label: "budget.subaccount" });

/* The updateInState action needs to have context so the indexed stores can
   obtain the ID. */
export const updateInStateAction = creator<Redux.UpdateModelPayload<Model.SubAccount>, C>(
  "UpdateInState",
);
export const requestSubAccountAction = creator<Redux.RequestPayload, C>("Request");
export const invalidateSubAccountAction = creator<null, C>("Invalidate");
// Currently, this action is not wired to anything but may be in the future.
export const loadingSubAccountAction = creator<boolean, C>("Loading");
export const responseSubAccountAction = creator<Http.RenderedDetailResponse<Model.SubAccount>, C>(
  "Response",
);
export const handleTableEventAction = creator<
  Table.Event<Tables.SubAccountRowData, Model.SubAccount>,
  TC
>("TableChanged");
export const loadingAction = creator<boolean, TC>("TableLoading");
export const requestAction = creator<Redux.TableRequestPayload, TC>("TableRequest");
export const responseAction = creator<Http.TableResponse<Model.SubAccount>, TC>("TableResponse");
export const setSearchAction = creator<string, TC>("SetTableSearch");
export const invalidateAction = creator<null, TC>("TableInvalidate");
