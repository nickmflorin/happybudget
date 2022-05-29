import { redux } from "lib";

export * as account from "./account";
export * as subAccount from "./subAccount";

type FC = FringesTableActionContext<Model.Template, Model.Account | Model.SubAccount, false>;
type C = BudgetActionContext<Model.Template, false>;
type TC = AccountsTableActionContext<Model.Template, false>;

const creator = redux.actions.createActionCreator({ label: "template" });

export const handleTableEventAction = creator<Table.Event<Tables.AccountRowData, Model.Account>, TC>("TableChanged");
export const requestAction = creator<Redux.TableRequestPayload, TC>("TableRequest");
export const loadingAction = creator<boolean, TC>("TableLoading");
export const responseAction = creator<Http.TableResponse<Model.Account>, TC>("TableResponse");
export const setSearchAction = creator<string, TC>("SetTableSearch");

export const loadingBudgetAction = creator<boolean, C>("Loading");
export const responseBudgetAction = creator<Http.RenderedDetailResponse<Model.Template>>("Response");
export const requestBudgetAction = creator<Redux.RequestPayload, C>("Request");
export const updateBudgetInStateAction = creator<Redux.UpdateModelPayload<Model.Template>>("UpdateInState");

export const loadingFringesAction = creator<boolean, FC>("fringes.Loading");
export const responseFringesAction = creator<Http.TableResponse<Model.Fringe>, FC>("fringes.Response");
export const handleFringesTableEventAction = creator<Table.Event<Tables.FringeRowData, Model.Fringe>, FC>(
  "fringes.TableChanged"
);
export const setFringesSearchAction = creator<string, FC>("fringes.SetSearch");
