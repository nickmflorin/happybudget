import { combineReducers, Reducer } from "redux";
import { createDetailResponseReducer, createSimplePayloadReducer } from "lib/redux/factories";
import { ActionType } from "../../actions";
import { createTemplateSubAccountsReducer } from "../factories";

const rootReducer: Reducer<Modules.Budgeting.Template.SubAccountStore, Redux.Action<any>> = combineReducers({
  id: createSimplePayloadReducer<number | null>(ActionType.Template.SubAccount.SetId, null),
  detail: createDetailResponseReducer<
    Model.TemplateSubAccount,
    Redux.ModelDetailResponseStore<Model.TemplateSubAccount>,
    Redux.Action
  >({
    Response: ActionType.Template.SubAccount.Response,
    Loading: ActionType.Template.SubAccount.Loading,
    Request: ActionType.Template.SubAccount.Request
  }),
  subaccounts: createTemplateSubAccountsReducer({
    Response: ActionType.Template.SubAccount.SubAccounts.Response,
    Request: ActionType.Template.SubAccount.SubAccounts.Request,
    Loading: ActionType.Template.SubAccount.SubAccounts.Loading,
    SetSearch: ActionType.Template.SubAccount.SubAccounts.SetSearch,
    UpdateInState: ActionType.Template.SubAccount.SubAccounts.UpdateInState,
    RemoveFromState: ActionType.Template.SubAccount.SubAccounts.RemoveFromState,
    AddToState: ActionType.Template.SubAccount.SubAccounts.AddToState,
    Select: ActionType.Template.SubAccount.SubAccounts.Select,
    Deselect: ActionType.Template.SubAccount.SubAccounts.Deselect,
    SelectAll: ActionType.Template.SubAccount.SubAccounts.SelectAll,
    Deleting: ActionType.Template.SubAccount.SubAccounts.Deleting,
    Creating: ActionType.Template.SubAccount.SubAccounts.Creating,
    Updating: ActionType.Template.SubAccount.SubAccounts.Updating,
    RemoveFromGroup: ActionType.Template.SubAccount.SubAccounts.RemoveFromGroup,
    AddToGroup: ActionType.Template.SubAccount.SubAccounts.AddToGroup,
    Groups: {
      Response: ActionType.Template.SubAccount.SubAccounts.Groups.Response,
      Request: ActionType.Template.SubAccount.SubAccounts.Groups.Request,
      Loading: ActionType.Template.SubAccount.SubAccounts.Groups.Loading,
      RemoveFromState: ActionType.Template.SubAccount.SubAccounts.Groups.RemoveFromState,
      UpdateInState: ActionType.Template.SubAccount.SubAccounts.Groups.UpdateInState,
      AddToState: ActionType.Template.SubAccount.SubAccounts.Groups.AddToState,
      Deleting: ActionType.Template.SubAccount.SubAccounts.Groups.Deleting
    }
  })
});

export default rootReducer;
