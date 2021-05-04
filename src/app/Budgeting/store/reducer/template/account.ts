import { combineReducers, Reducer } from "redux";
import { createDetailResponseReducer, createSimplePayloadReducer } from "lib/redux/factories";
import { ActionType } from "../../actions";
import { createTemplateSubAccountsReducer } from "../factories";

const rootReducer: Reducer<Redux.Budgeting.Template.AccountStore, Redux.Action<any>> = combineReducers({
  id: createSimplePayloadReducer<number | null>(ActionType.Template.Account.SetId, null),
  detail: createDetailResponseReducer<
    Model.TemplateAccount,
    Redux.ModelDetailResponseStore<Model.TemplateAccount>,
    Redux.Action
  >({
    Response: ActionType.Template.Account.Response,
    Loading: ActionType.Template.Account.Loading,
    Request: ActionType.Template.Account.Request,
    UpdateInState: ActionType.Template.Account.UpdateInState
  }),
  subaccounts: createTemplateSubAccountsReducer({
    Response: ActionType.Template.Account.SubAccounts.Response,
    Request: ActionType.Template.Account.SubAccounts.Request,
    Loading: ActionType.Template.Account.SubAccounts.Loading,
    SetSearch: ActionType.Template.Account.SubAccounts.SetSearch,
    UpdateInState: ActionType.Template.Account.SubAccounts.UpdateInState,
    RemoveFromState: ActionType.Template.Account.SubAccounts.RemoveFromState,
    AddToState: ActionType.Template.Account.SubAccounts.AddToState,
    Select: ActionType.Template.Account.SubAccounts.Select,
    Deselect: ActionType.Template.Account.SubAccounts.Deselect,
    SelectAll: ActionType.Template.Account.SubAccounts.SelectAll,
    Deleting: ActionType.Template.Account.SubAccounts.Deleting,
    Creating: ActionType.Template.Account.SubAccounts.Creating,
    Updating: ActionType.Template.Account.SubAccounts.Updating,
    RemoveFromGroup: ActionType.Template.Account.SubAccounts.RemoveFromGroup,
    Groups: {
      Response: ActionType.Template.Account.SubAccounts.Groups.Response,
      Request: ActionType.Template.Account.SubAccounts.Groups.Request,
      Loading: ActionType.Template.Account.SubAccounts.Groups.Loading,
      RemoveFromState: ActionType.Template.Account.SubAccounts.Groups.RemoveFromState,
      UpdateInState: ActionType.Template.Account.SubAccounts.Groups.UpdateInState,
      AddToState: ActionType.Template.Account.SubAccounts.Groups.AddToState,
      Deleting: ActionType.Template.Account.SubAccounts.Groups.Deleting
    }
  })
});

export default rootReducer;
